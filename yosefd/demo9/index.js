var express = require('express');
var http = require('http');

var srv = express();
var server = http.createServer(srv);
server.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.info('request to root');
  res.send('<font size="20">try anode yourself, mail <font color="red"><b>yosefd@microsoft.com</b></font> to get access to the playground</font>', 200);
});