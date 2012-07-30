var express = require('express');
var path = require('path');
var fs = require('fs');

var server = express.createServer();
var port = 12345;

// would actually be some db primary keyed by account id
// with nonclustered index on liveId
var accounts = new Object();
var attributes = new Object();

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
    res.json(acct);
});

server.get('/:id/Account/home', function(req, res) {
  var acct = getAccount(req.params.id);
  if (acct == null) {
    res.send("Account not found!", 404);
    return;
  }
  fs.readFile(path.join(__dirname, 'public', 'account_home.html'), function(err, data) {
    if (err) {
      res.send(err, 500);
      return;
    }
    data = data.toString().replace('__ACCT__', htmlStringify(acct))
      .replace('__ATTR__', 'attributes here');
    res.send(data);
  });
});

server.get('/:id/Account/edit', function(req, res) {
  var acct = getAccount(req.params.id);
  if (acct == null)
    res.send("Account not found!", 404);
  else {
    fs.readFile(path.join(__dirname, 'public', 'edit_account.html'), function(err, data) {
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
    res.json(acct);
});

server.get('/GetAccountIdByIdentity(:identity)', function(req, res) {
  function reverseLookup(fstId, sndId) {
    for (var aid in accounts)
      if (accounts[aid].liveId == fstId)
        return { id: aid };
    return null;
  }

  try {
    // This is obviously extremely vulnerable to a JS injection,
    // but this is just code for an internal demo with fake users
    // so I'm not going to bother with sanitization.
    var aid = eval('reverseLookup' + req.params.identity);
    if (aid)
      res.json(aid);
    else
      res.send('Account not found!', 404);
  } catch (e) {
    if (e.name == 'ReferenceError')
      res.send('Invalid request. Did you remember to enclose your Live ID in single quotes?', 400);
    else
      throw e;
  }
});

server.get('/:id/Attributes(:name)', function(req, res) {
  var aid = req.params.id;
  function getAttr(name) {
    var attrs = attributes[aid];
    if (attrs == undefined)
      return undefined;
    return attrs[name];
  }
  // Same deal as above with the injection
  var attr = eval('getAttr' + req.params.name);
  if (attr)
    res.json({ name: req.params.name, value: attr });
  else
    res.send("Attribute not found. This may be because there is no attribute with this name or the account does not exist.", 404);
});

server.put('/:id/Attributes(:name)', function(req, res) {
  var aid = req.params.id;
  if (attributes[aid] == undefined)
    attributes[aid] = new Object();
  attributes[aid][req.body.name] = req.body.value;
  res.json(req.body);
});
  

server.del('/:id/Attributes(:name)', function(req, res) {
  var aid = req.params.id;
  function delAttr(name) {
    var attrs = attributes[aid];
    if (attrs == undefined || attrs[name] == undefined)
      return false;
    delete attrs[name];
    return true;
  }
  // Same deal as above with the injection
  var success = eval('delAttr' + req.params.name);
  if (success)
    res.send(204);
  else
    res.send("Attribute not found. This may be because there is no attribute with this name or the account does not exist.", 404);
});
  

server.post('/signup/submit', function(req, res) {
  console.log(req);
  res.send('<data><result>0</result><aid>' + newGuid() + '</aid></data>',
           { 'Content-Type': 'application/xml' }, 201);
});

server.listen(process.env.PORT || port, function() {
  console.log('Server listening');
});
