/*************************************
 * DEPENDENCIES
 **********************************/
var express = require("express")
var fs = require("fs")
var bodyParser = require("body-parser")
var pug = require("pug")

/************************************
 * ExpressJS Setup
 ************************************/
app = express()
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
app.listen("8000");

/*********************************
 * GLOBAL Functions
 *******************************/
 function get_response(body, title) {
     if(!title || typeof title === 'undefined') {
         title = "Budget Application";
     }
     var response = fs.readFileSync("html/header.html") + pug.renderFile("pug/title.pug", {title: title});
     response += body;
     response += fs.readFileSync("html/footer.html");
     return response;
 }

/***********************************
 * ROUTING
 **********************************/

app.get("/", function (req, res) {
    res.send(get_response("Hello World"));
})
