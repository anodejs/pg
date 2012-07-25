var express = require('express');

var server = express.createServer();
var port = 12345;

var accounts = new Object();

// stubbed out, eventually use mongodb
function addAccount(req) {
  if (accounts[req.params.id] != undefined)
    return null;
  else {
    var acct = req.body;
    acct.status = 'enabled';
    accounts[req.params.id] = acct;
    return acct;
  }
}

function getAccount(id) {
  return accounts[id];
}

function updateAccount(req) {

}

server.configure(function() {
  server.use(express.methodOverride());
  server.use(express.bodyParser());
  server.use(server.router);
  server.use(express.static(__dirname + '/public'));
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.get('/:id/Account', function(req, res) {
  var acct = getAccount(req.params.id);
  if (acct == undefined)
    res.send("Account not found!");
  else
    res.send(acct);
});

server.post('/:id/Account', function(req, res) {
  var acct = addAccount(req);
  if (acct == null) {
    res.json(null);
  }
  else {
    res.json(acct, 201);
  }
});

server.post('/signup/submit', function(req, res) {
  console.log(req);
  res.send('<data><result>0</result><aid>' + newGuid() + '</aid></data>',
           { 'Content-Type': 'application/xml' }, 201);
});

server.put('/:id/Account', function(req, res) {
  var acct = updateAccount(req);
  if (acct == null)
    res.send('Account not found!');
  else
    res.send(acct);
});

server.listen(process.env.PORT || 12345, function() {
  console.log('Server listening');
});
