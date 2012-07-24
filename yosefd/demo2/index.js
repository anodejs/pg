var express = require('express');

console.info('starting demo2');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res){
  console.info('request to root');
  res.send('hello from anode demo2', 200);
});

console.info('demo2 started');