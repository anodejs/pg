var express = require('express');

console.info('demo starting');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

var count = 0;

srv.get('/', function(req, res) {
  console.info('root count:', count++);
  res.send('Hello from anode!', 200);
});

srv.get('/bad/?', function(req, res) {
  console.error('forbidden!!!');
  res.send('not here!!!', 403);
});

srv.get('/3min/?', function(req, res){
  setTimeout(function(){
    res.send('3min passed', 200);
  }, 3 * 60 * 1000);
});

console.info('demo started');