var express = require('express');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.log('paid visit');
  res.send('Hello from anode demo4', 200);
});

srv.get('/mmm/?', function(req, res) {
  console.warn('tried us');
  res.send('not for your eyes', 403);
});