/*************************************
 * DEPENDENCIES
 **********************************/
var express = require("express")
var bodyParser = require("body-parser")

/************************************
 * ExpressJS Setup
 ************************************/
app = express()
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
app.listen("8000");

/***********************************
 * ROUTING
 **********************************/

app.get("/", function (req, res) {
    res.send("Hello World");
})
