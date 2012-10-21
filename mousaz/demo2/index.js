var express = require("express");

var server = express.createServer();

server.get("/", function (req, res) {
  console.info("request received");
  res.end("Hello PalDev");
});

server.listen(process.env.PORT || 5000);

console.info("server is running");
