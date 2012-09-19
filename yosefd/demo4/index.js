var express = require('express');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.log('paid visit');
  res.send(',font size="20">try anode yourself, mail <b>yosefd@microsoft.com</b> to get access to the playground</font>', 200);
});

srv.get('/mmm/?', function(req, res) {
  console.warn('tried us');
  res.send('not for your eyes', 403);
});