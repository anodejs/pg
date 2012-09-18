var express = require('express');

console.info('Start demo3');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.log('demo3 request');
  res.send('Hello from anode demo3', 200);
});

srv.get('/bad/?', function(req, res) {
  console.error('demo3 forbidden zone!!!');
  res.send('demo3 no no', 403);
});

console.info('demo3 started');