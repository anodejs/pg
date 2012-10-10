var express = require('express');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.info('got req');
  res.send('<font size="20">Gilad, please try anode yourself, mail <font color="red"><b>yosefd@microsoft.com</b></font> to get access to the playground</font>', 200);
});

srv.get('/bad/?', function(req, res) {
  console.warn('bad request');
  res.send('bad request', 403);
});