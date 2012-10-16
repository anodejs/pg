var express = require('express');

var srv = express.createServer();

srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.info('demo6 was accessed');
  res.send('anode demo is alive', 200);
});