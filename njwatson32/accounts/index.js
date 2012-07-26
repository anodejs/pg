var express = require('express');
var path = require('path');
var fs = require('fs');

var server = express.createServer();
var port = 12345;

var accounts = new Object();

// stubbed out, eventually use mongodb
function addAccount(req) {
  if (accounts[req.params.id] != undefined)
    return null;
  else {
    var acct = req.body;
    acct.status = 'active';
    //acct.joinDate = new Date();
    accounts[req.params.id] = acct;
    return acct;
  }
}

function getAccount(id) {
  return accounts[id];
}

function updateAccount(req) {
  if (accounts[req.params.id] == undefined)
    return null;
  req.body.status = 'active';
  accounts[req.params.id] = req.body;
  return req.body;
}

server.configure(function() {
  server.use(express.methodOverride());
  server.use(express.bodyParser());
  server.use(server.router);
  server.use(express.static(path.join(__dirname, 'public')));
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

function htmlStringify(obj) {
  var tab = '&nbsp;&nbsp;&nbsp;&nbsp;';
  var str = '{<br />';  
  for (var prop in obj) {
    str += tab + prop + ': ' + obj[prop] + '<br />';
  }
  return str + '}';
}

server.get('/:id/Account', function(req, res) {
  var acct = getAccount(req.params.id);
  if (acct == null)
    res.send("Account not found!", 404);
  else
    res.send(acct);
});

server.get(':id/Account/home', function(req, res) {
  
});

server.get('/:id/Account/edit', function(req, res) {
  var acct = getAccount(req.params.id);
  if (acct == null)
    res.send("Account not found!", 404);
  else {
    fs.readFile(path.join(__dirname, 'edit_account.html'), function(err, data) {
      if (err) {
        res.send(err, 500);
        return;
      }
      var nameHtml = 'First Name: <input type="text" id="fst" value="__FST__"/> Last Name: <input type="text" id="lst" value="__LST__"/>';
      if (acct.cmp != '')
        nameHtml = 'Company Name: <input type="text" id="cmp" value="__CMP__"/>'
      data = data.toString().replace('__NAME_HTML__', nameHtml)
        .replace('__ACCT_OBJ__', htmlStringify(acct))
        .replace('__ACCT_ID__', req.params.id)
        .replace('__FST__', acct.fst)
        .replace('__LST__', acct.lst)
        .replace('__CMP__', acct.cmp)
        .replace('__LIVE_ID__', acct.liveId)
        .replace('__PUID__', acct.puid)
        .replace('__LANG__', acct.lang)
        .replace('__C__', acct.country);
      res.send(data);
    });
  }
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

server.put('/:id/Account', function(req, res) {
  var acct = updateAccount(req);
  if (acct == null)
    res.send('Account not found!', 404);
  else
    res.send(acct);
});

server.post('/signup/submit', function(req, res) {
  console.log(req);
  res.send('<data><result>0</result><aid>' + newGuid() + '</aid></data>',
           { 'Content-Type': 'application/xml' }, 201);
});

server.listen(process.env.PORT || port, function() {
  console.log('Server listening');
});
