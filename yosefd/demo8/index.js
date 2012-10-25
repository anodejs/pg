var express = require('express');

var srv = express.createServer();
srv.listen(process.env.PORT || 5000);

srv.get('/', function(req, res) {
  console.info('something happened');
  res.send('<font size="20">try anode yourself, mail <font color="red"><b>yosefd@microsoft.com</b></font> to get access to the playground</font>', 200);
});