var express = require('express');
var path = require('path');
var fs = require('fs');
var azure = require('azure');

var server = express.createServer();
var port = 12345;

var acctsTable = 'accounts';
var acctKey = 'accts';
var attrKey = 'attrs';
var azureProps = { id: true, link: true, updated: true, etag: true,
                   PartitionKey: true, RowKey: true, Timestamp: true };
var tableService = azure.createTableService();
tableService.createTableIfNotExists(acctsTable, function(error) {
  if (error) {
    console.log(error);
    process.exit(1);
  }
  else {
    console.log('Azure storage connection established');
  }
});

// callback(error)
function addAccount(req, callback) {
  req.body.PartitionKey = acctKey;
  req.body.RowKey = req.body.aid;
  req.body.status = 'active';
  tableService.insertEntity(acctsTable, req.body, function(error) {
    if (error)
      callback(error)
    else {
      var attrs = { PartitionKey: attrKey, RowKey: req.body.aid };
      tableService.insertEntity(acctsTable, attrs, callback);
    }
  });    
}

// callback(error, entity)
function getAccount(aid, callback) {
  tableService.queryEntity(acctsTable, acctKey, aid, callback);
}

// callback(error, entities)
function getAllAccounts(callback) {
  var query = azure.TableQuery
    .select('*')
    .from(acctsTable)
    .where('PartitionKey eq ?', acctKey);
  tableService.queryEntities(query, callback);
}

// callback(error, entity)
function getAttributes(aid, callback) {
  tableService.queryEntity(acctsTable, attrKey, aid, callback);
}

// callback(error, acct, attrs)
function getAcctAndAttrs(aid, callback) {
  getAccount(aid, function(error, acct) {
    if (error) {
      callback(error, acct, { });
      return;
    }
    getAttributes(aid, function(error, attrs) {
      callback(error, acct, attrs);
    });
  });
}

// callback(error)
function updateAccount(req, callback) {
  req.body.PartitionKey = acctKey;
  req.body.RowKey = req.params.aid;
  tableService.updateEntity(acctsTable, req.body, callback);
}

// callback(error)
function deleteAccount(id, callback) {
  tableService.deleteEntity(acctsTable, {
    PartitionKey: acctKey,
    RowKey: id
  }, callback);
}

// callback(error)
function putAttribute(id, name, value, callback) {
  var attr = {
    PartitionKey: attrKey,
    RowKey: id
  };
  attr[name] = value;
  tableService.insertOrMergeEntity(acctsTable, attr, callback);
}

// callback(error)
function delAttribute(id, name, attrs, callback) {
  delete attrs[name];
  attrs.PartitionKey = attrKey;
  attrs.RowKey = id;
  tableService.updateEntity(acctsTable, attrs, callback);
}

function htmlStringify(obj) {
  var tab = '&nbsp;&nbsp;&nbsp;&nbsp;';
  var str = '{<br />';
  for (var prop in obj) {
    if (!azureProps[prop])
      str += tab + prop + ': ' + obj[prop] + '<br />';
  }
  return str + '}';
}

function id(obj) { return obj; }

server.configure(function() {
  server.use(express.methodOverride());
  server.use(express.bodyParser());
  server.use(server.router);
  server.use(express.static(path.join(__dirname, 'public')));
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// ----------------- REST Interface -----------------

server.get('/:aid/Account', function(req, res) {
  getAccount(req.params.aid, function(error, acct) {
    if (error)
      res.send('Account not found!', 404);
    else
      res.json(acct);
  });
});

server.post('/:aid/Account', function(req, res) {
  addAccount(req, function(error) {
    if (error) {
      console.log(error);
      res.json(null);
    }
    else {
      res.json(req.body, 201);
    }
  });
});

server.put('/:aid/Account', function(req, res) {
  updateAccount(req, function(error) {
    if (error) {
      console.log(error);
      res.send('Account not found!', 404);
    }
    else {
      res.json(req.body);
    }
  });
});

server.del('/:aid/Account', function(req, res) {
  deleteAccount(req.params.aid, function(error) {
    if (error)
      res.send(404);
    else
      res.send(204);
  });
});

/*
server.get('/GetAccountIdByIdentity(:identity)', function(req, res) {
  function reverseLookup(fstId, sndId) {
    var accounts = getAllAccounts();
    for (var aid in accounts)
      if (accounts[aid].liveId == fstId)
        return { aid: aid };
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
*/

server.get('/:aid/Attributes(:name)', function(req, res) {
  getAttributes(req.params.aid, function(error, attrs) {
    if (error) {
      res.send('Account does not exist.', 404);
      return;
    }
    // This is obviously extremely vulnerable to a JS injection,
    // but this is just code for an internal demo with fake users
    // so I'm not going to bother with sanitization.
    var name = eval('id' + req.params.name);
    var attr = attrs[name];
    if (attr == undefined)
      res.send('Attribute not found', 404);
    else
      res.json({ name: name, value: attr });
  });
});

server.put('/:aid/Attributes(:name)', function(req, res) {
  var name = req.body.name, value = req.body.value;
  putAttribute(req.params.aid, name, value, function(error) {
    if (error)
      res.send("Account doesn't exist!", 404);
    else
      res.json({ name: name, value: value });
  });
});
  

server.del('/:aid/Attributes(:name)', function(req, res) {
  // This is obviously extremely vulnerable to a JS injection,
  // but this is just code for an internal demo with fake users
  // so I'm not going to bother with sanitization.
  var name = eval('id' + req.params.name);
  getAttributes(req.params.aid, function(error, attrs) {
    if (error) {
      console.log(error);
      res.send("Account doesn't exist!", 404);
      return;
    }
    delAttribute(req.params.aid, name, attrs, function(error) {
      if (error) {
        console.log(error);
        res.send('Attribute could not be deleted', 500);
      }
      else {
        res.send(204);
      }
    });
  });
});

// ---------------- Test Interface ----------------

server.get('/dropTable', function(req, res) {
  tableService.deleteTable(acctsTable, function(error) {
    res.send(error);
  });
});

server.get('/', function(req, res) {
  fs.readFile(path.join(__dirname, 'public', 'all_accounts.html'), function(err, data) {
    if (err) {
      res.send(err, 500);
      return;
    }
    
    function td(name) {
      return '<td>' + name + '</td>';
    }
    function del(acct) {
      return '<td><input type="checkbox" name="del" value="' +
        acct.aid + '"/></td>';
    }

    getAllAccounts(function(error, accounts) {
      var entries = '';
      for (var i = 0; i < accounts.length; i++) {
        var acct = accounts[i];
        var name = td(acct.fst) + td(acct.lst);
        if (acct.cmp)
          name = td(acct.cmp) + td('-');
        entries += '<tr>' + del(acct) +
          td('<a href="/' + acct.aid + '/Account/home">' + acct.aid + '</a>') +
          name + td(acct.email) + /* td(acct.liveId) + td(acct.puid) + */
        td(acct.lang) + td(acct.country) + '</tr>';
      }
      res.send(data.toString().replace('__ACCTS__', entries));
    });
  });
});

server.get('/:aid/Account/home', function(req, res) {
  getAcctAndAttrs(req.params.aid, function(error, acct, attrs) {
    if (error) {
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'account_home.html'), function(err, data) {
      if (err) {
        res.send(err, 500);
        return;
      }
      data = data.toString().replace('__ACCT__', htmlStringify(acct))
        .replace('__ATTR__', htmlStringify(attrs));
      res.send(data);
    });
  });
});

server.get('/:aid/Account/edit', function(req, res) {
  getAccount(req.params.aid, function(error, acct) {
    if (error) {
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'edit_account.html'), function(err, data) {
      if (err) {
        res.send(err, 500);
        return;
      }
      var nameHtml = 'First Name: <input type="text" id="fst" value="__FST__"/> Last Name: <input type="text" id="lst" value="__LST__"/>';
      if (acct.cmp)
        nameHtml = 'Company Name: <input type="text" id="cmp" value="__CMP__"/>'
      data = data.toString().replace('__NAME_HTML__', nameHtml)
        .replace('__ACCT_OBJ__', htmlStringify(acct))
        .replace('__ACCT_ID__', req.params.aid)
        .replace('__FST__', acct.fst)
        .replace('__LST__', acct.lst)
        .replace('__CMP__', acct.cmp)
        .replace('__EMAIL__', acct.email)
//      .replace('__LIVE_ID__', acct.liveId)
//      .replace('__PUID__', acct.puid)
        .replace('__LANG__', acct.lang)
        .replace('__C__', acct.country);
      res.send(data);
    });
  });
});

server.get('/:aid/Account/addAttr', function(req, res) {
  getAccount(req.params.aid, function(error, acct) {
    if (error) {
      console.log(error);
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'add_attr.html'), function(err, data) {
      if (err) {
        res.send(err, 500);
        return;
      }
      res.send(data.toString());
    });
  });
});

server.get('/:aid/Account/delAttr', function(req, res) {
  getAcctAndAttrs(req.params.aid, function(error, acct, attrs) {
    if (error) {
      console.log(error);
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'del_attr.html'), function(err, data) {
      if (err) {
        res.send(err, 500);
        return;
      }
      var attrList = ''
      for (var name in attrs) {
        if (!azureProps[name])
          attrList += '<option value="' + name + '">' + name + '</option>';
      }
      data = data.toString().replace('__ATTRS__', attrList);
      res.send(data);
    });
  });
});

server.get('/about', function(_, res) {
  res.send('Nick is great');
});

server.listen(process.env.PORT || port, function() {
  console.log('Server listening');
});
