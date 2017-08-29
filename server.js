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
  if (
    (!req.session || !req.session.authorized_user) &&
    req.originalUrl.indexOf("login") == -1 &&
    req.originalUrl.indexOf(".css") == -1 &&
    req.originalUrl.indexOf(".js") == -1
  ) {
    res.redirect("/login");
  } else {
    next();
  }
});

app.listen("8000", function(err) {
  console.log("Listening on http://127.0.0.1:8000");
});

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

/***********************************
 * ROUTING
 **********************************/

app.get("/", function(req, res) {
  res.send(
    get_response(fs.readFileSync("html" + path.sep + "home-page.html", "utf8"))
  );
});

app.get("/login", function(req, res) {
  res.send(get_response("Login here"));
});
