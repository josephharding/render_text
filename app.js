var express = require("express");
var app = express();

var port = process.env.PORT || 8080;
app.listen(port);

app.get("/", function(req, res){
  res.sendFile(__dirname + "/public/index.html");
});

console.log("server running at " + port);
app.use(express.static(__dirname + '/public'));
