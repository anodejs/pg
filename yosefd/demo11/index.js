var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);
server.listen(process.env.PORT || 5000);

app.get('/', function(req, res) {
  console.info('got get request to root');
  res.send('<font size="20">try anode yourself, mail <font color="red"><b>yosefd@microsoft.com</b></font> to get access to the playground</font>', 200);
});