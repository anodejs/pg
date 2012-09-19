var express = require('express');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  res.send('Hello from anode demo4', 200);
});