/*************************************
 * DEPENDENCIES
 **********************************/
var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var pug = require("pug");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var path = require("path");
var _ = require("underscore");
var https = require("https");
var http = require("http");
var mysql = require("mysql");
var Q = require("q");

/************************************
 * ExpressJS Setup
 ************************************/

app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var options = {
    host: "cs4830.ddns.net",
    port: 3306,
    user: "webuser",
    password: "Buget_123",
    database: "budget"
};

var sessionStore = new MySQLStore(options);

app.use(
    session({
        key: "session_cookie_name",
        secret: "session_cookie_secret",
        store: sessionStore,
        resave: false,
        saveUninitialized: false
    })
);

//login
app.use(function (req, res, next) {
    if (
        (!req.session || !req.session.authorized_user) &&
        req.originalUrl.indexOf("login") == -1 &&
        req.originalUrl.indexOf(".css") == -1 &&
        req.originalUrl.indexOf(".js") == -1 &&
        req.originalUrl.indexOf("create") == -1
    ) {
        res.redirect("/login");
    } else {
        next();
    }
});

https
    .createServer(
        {
            key: fs.readFileSync("ssl/key.pem"),
            cert: fs.readFileSync("ssl/cert.pem")
        },
        app
    )
    .listen(443, function () {
        console.log("Server Running!");
    });

http
    .createServer(function (req, res) {
        res.writeHead(302, {Location: "https://" + req.headers.host + "/"});
        res.end();
    })
    .listen(80);

/*********************************
 * GLOBAL Functions
 *******************************/
function get_response(body, title) {
    if (!title || typeof title === "undefined") {
        title = "Budget Application";
    }
    var response =
        fs.readFileSync("html" + path.sep + "header.html", "utf8") +
        pug.renderFile("pug" + path.sep + "title.pug", {title: title});
    response += body;
    response += fs.readFileSync("html" + path.sep + "footer.html", "utf8");
    return response;
}

function send_html_file(file) {
    if (file.substring(file.length - 5) != ".html") {
        file = file + ".html";
    }
    var body = fs.readFileSync("html" + path.sep + file, "utf8");
    var r = get_response(body);
    return r;
}

function authenticate(username, password) {
    var dfd = Q.defer();
    var conn = mysql.createConnection(options);
    conn.connect(function (err) {
        if (err) {
            console.log(err);
            dfd.resolve(false);
        }
        conn.query(
            "SELECT * FROM users WHERE username = ? and password = ?",
            [username, password],
            function (err, result) {
                if (err) {
                    dfd.resolve(false);
                }
                var returnVal = result != null && result.length > 0;
                dfd.resolve(returnVal);
            }
        );
    });
    return dfd.promise;
}

function error(err) {
    console.error(err);
    return err;
}

/***********************************
 * ROUTING
 **********************************/

app.get("/", function (req, res) {
    res.send(send_html_file("home-page"));
});

app.get("/login", function (req, res) {
    res.send(send_html_file("login"));
});

app.post("/login", function (req, res) {
    authenticate(req.body.username, req.body.password).then(function (valid) {
        if (valid) {
            req.session.authorized_user = req.body.username;
            res.redirect("/");
        } else {
            res.status(403).send(send_html_file("unauthorized"));
        }
    });
});

app.get("/view-transactions", function (req, res) {
    res.send(send_html_file("transactions"));
});

app.post("/add", function (req, res) {
    var trans = req.body.data;
    trans.push(req.session.authorized_user);
    var conn = mysql.createConnection(options);
    conn.connect(function (err) {
        if (err) {
            res.status(500).send(error(err));
        } else {
            conn.query(
                "INSERT INTO transaction(date, description, amount, type, username) VALUES \
              (?,?,?,?,?)",
                trans,
                function (err, result) {
                    if (err) {
                        res.status(500).send(error(err));
                    } else {
                        res.send("Success");
                    }
                }
            );
        }
    });
});

app.post("/get-transactions", function (req, res) {
    var conn = mysql.createConnection(options);
    conn.connect(function (err) {
        if (err) {
            res.send(error(err));
        }
        conn.query(
            "SELECT date(date) as date, description, amount, type, id FROM transaction WHERE username = ?",
            [req.session.authorized_user],
            function (err, result) {
                if (err) {
                    res.send(error(err));
                }
                res.send(result);
            }
        );
    });
});

app.get("/edit-transaction", function (req, res) {
    var conn = mysql.createConnection(options);
    conn.connect(function (err) {
        if (err) {
            res.status(500).send(error(err));
        }
        conn.query(
            "SELECT date(date) as date, description, amount, type FROM transaction WHERE username = ? AND id = ?",
            [req.session.authorized_user, req.query.id],
            function (err, result) {
                if (err || result.length < 1) {
                    res.status(500).send(error(err));
                }
                else {
                    result[0].date = result[0].date.toISOString().substring(0, 10);
                    res.send(get_response(pug.renderFile("pug/edit-transaction.pug", {transaction: result[0], id : req.query.id})))
                }
            }
        );
    });
});

app.post("/update", function(req, res) {
    var id = req.body.id;
    var new_date = req.body.new_date;
    var new_desc = req.body.new_description;
    var new_amount = req.body.new_amount;

    var conn = mysql.createConnection(options);
    conn.connect(function (err) {
        if (err) {
            res.status(500).send(error(err));
        }
        conn.query(
            "UPDATE transaction SET date = ?, description = ?, amount = ? WHERE username = ? AND id = ?",
            [new_date, new_desc, new_amount, req.session.authorized_user, id],
            function (err, result) {
                if (err || result.length < 1) {
                    res.status(500).send(error(err));
                }
                else {
                    res.send(get_response(pug.renderFile("pug/success.pug")))
                }
            }
        );
    });
});
