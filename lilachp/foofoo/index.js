var http = require('http');
http.createServer(function(req, res) {
 console.log('new request from ' + req.url);
 console.warn('this is a warning');
 console.error('this is an error');
 res.end('yo yo yo from anode!'); 
}).listen(process.env.PORT || 5000);
console.log('info1: foofoo started at', new Date());
