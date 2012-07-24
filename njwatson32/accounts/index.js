var express = require('express');

var server = express.createServer();
var port = 12345;

server.configure(function() {
  server.use(express.methodOverride());
  server.use(express.bodyParser());
  server.use(server.router);
  server.use(express.static(__dirname + '/public'));
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.get('/', function(req, res) {
  res.send('Welcome to the MicroHard Corporation!');
});

server.listen(port, function() {
  console.log('Server listening on port %d', port);
});
