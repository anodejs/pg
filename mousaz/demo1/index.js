var express = require("express");

var server = express.createServer();

server.get("/", function (req, res) {
  console.info("received request");
  res.end("Hello PalDev");
});

server.listen(process.env.port || 5000);

console.info("Server started!");
