var express = require('express');

console.info('try2 starting');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

var count = 0;

srv.get('/', function(req, res) {
  console.info('home', count++);
  res.send('Hello from anode!', 200);
});

console.info('try2 started');