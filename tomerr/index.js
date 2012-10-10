var express = require('express');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.info('app was accessed');
  res.send('Hi Tomer!', 200);
});