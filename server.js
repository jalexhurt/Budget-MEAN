/*************************************
 * DEPENDENCIES
 **********************************/
var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var pug = require("pug");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);

/************************************
 * ExpressJS Setup
 ************************************/

app = express();
app.use(bodyParser.urlencoded({ extended: false }));
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
app.listen("8000");

/*********************************
 * GLOBAL Functions
 *******************************/
function get_response(body, title) {
  if (!title || typeof title === "undefined") {
    title = "Budget Application";
  }
  var response =
    fs.readFileSync("html/header.html") +
    pug.renderFile("pug/title.pug", { title: title });
  response += body;
  response += fs.readFileSync("html/footer.html");
  return response;
}

/***********************************
 * ROUTING
 **********************************/

app.get("/", function(req, res) {
  res.send(get_response("Hello World"));
});
