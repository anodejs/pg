var express = require('express');

console.info('try1 starting');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.info('try1 root');
  res.send("Hello from anode!", 200);
});

srv.get('/anode/?', function(req, res) {
  console.info('try1 anode');
  res.send("Hello from anode again!", 200);
});

console.info('try1 started');