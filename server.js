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

/************************************
 * ExpressJS Setup
 ************************************/

app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var options = {
  host: "localhost",
  port: 3306,
  user: "webuser",
  password: "webBuget_123",
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
app.use(function(req, res, next) {
  console.log("Trying to load: " + req.originalUrl);
  if (
    (!req.session || !req.session.authorized_user) &&
    req.originalUrl.indexOf("login") == -1 &&
    req.originalUrl.indexOf("unauthorized") == -1 &&
    req.originalUrl.indexOf(".css") == -1 &&
    req.originalUrl.indexOf(".js") == -1
  ) {
    res.redirect("/login");
  } else {
    next();
  }
});

https
  .createServer({
    key: fs.readFileSync("ssl/key.pem"),
    cert: fs.readFileSync("ssl/cert.pem")
  }, app)
  .listen(443, function() {
    console.log("Server Running!");
  });

http.createServer(function(req, res) {
    console.log(req.headers.host);
    res.writeHead(302, {"Location" : "https://" + req.headers.host + "/"});
    res.end();
}).listen(80);

/*********************************
 * GLOBAL Functions
 *******************************/
function get_response(body, title) {
  if (!title || typeof title === "undefined") {
    title = "Budget Application";
  }
  var response =
    fs.readFileSync("html" + path.sep + "header.html", "utf8") +
    pug.renderFile("pug" + path.sep + "title.pug", { title: title });
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
  if (username == "alex" && password == "admin") {
    return true;
  }
  return false;
}

/***********************************
 * ROUTING
 **********************************/

app.get("/", function(req, res) {
  res.send(send_html_file("home-page"));
});

app.get("/login", function(req, res) {
  res.send(send_html_file("login"));
});

app.post("/login", function(req, res) {
  if (authenticate(req.body.username, req.body.password)) {
    req.session.authorized_user = req.body.username;
    res.redirect("/");
  } else {
    res.redirect("/unauthorized");
  }
});

app.get("/unauthorized", function(req, res) {
  res.status(403).send(send_html_file("unauthorized"));
});
