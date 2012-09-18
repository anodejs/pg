var express = require('express');

console.info('Start demo3');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.log('demo3 request');
  res.send('Hello from anode demo3', 200);
});

console.info('demo3 started');