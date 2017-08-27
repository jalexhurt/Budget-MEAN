var express = require("express")
var bodyParser = require("body-parser")

app = express()

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json())


app.listen("8000");

app.get("/", function (req, res) {
    res.send("Hello World");
})
