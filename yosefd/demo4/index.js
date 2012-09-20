var express = require('express');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.log('paid visit');
  res.send('<font size="20">try anode yourself, mail <font color="red"><b>yosefd@microsoft.com</b></font> to get access to the playground</font>', 200);
});

srv.get('/mmm/?', function(req, res) {
  console.warn('tried mmm');
  res.send('<font size="20">twitter yosefdi</font>', 403);
});

srv.get('/xxx/?', function(req, res) {
  console.warn('tried xxx');
  res.send('twitter yosefdi', 403);
});