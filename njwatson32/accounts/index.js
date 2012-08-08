var express = require('express');
var path = require('path');
var fs = require('fs');
var azure = require('azure');
var async = require('async');

var server = express.createServer();
var port = 12345;

var acctsTable = 'accounts';
var acctRowKey = '_';
var azureProps = { id: true, link: true, updated: true, etag: true,
                   PartitionKey: true, RowKey: true, Timestamp: true };
var tableService = azure.createTableService();
tableService.createTableIfNotExists(acctsTable, function(error) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  else {
    console.log('Azure storage connection established');
  }
});

// callback(error)
function addAccount(req, callback) {
  req.body.PartitionKey = req.body.aid;
  req.body.RowKey = acctRowKey;
  req.body.status = 'active';
  tableService.insertEntity(acctsTable, req.body, callback);
}

// callback(error, entity)
function getAccount(aid, callback) {
  tableService.queryEntity(acctsTable, aid, acctRowKey, callback);
}

// callback(error, entities)
function getAllAccounts(callback) {
  var query = azure.TableQuery
    .select('*')
    .from(acctsTable)
    .where('RowKey eq ?', acctRowKey);
  tableService.queryEntities(query, callback);
}

// callback(error)
function updateAccount(req, callback) {
  req.body.PartitionKey = req.params.aid;
  req.body.RowKey = acctRowKey;
  tableService.updateEntity(acctsTable, req.body, callback);
}

// Also deletes attributes
// batch thing doesn't work
// callback(error)
function deleteAccount(aid, attrs, callback) {
  var tasks = attrs; // rename
  tasks.push({ PartitionKey: aid, RowKey: acctRowKey });
  tableService.beginBatch();
  async.forEach(tasks, function(task, callback) {
    tableService.deleteEntity(acctsTable, task, function(error) {
      if (!error) {
        callback(null);
      }
      else {
        console.error(error);
        callback(error);
      }
    });
  }, function(error) {
    if (error) {
      console.error(error);
      callback(error);
      return;
    }
    tableService.commitBatch(callback);
  });
}

// callback(error, attrsArray)
function getAttributesArray(aid, callback) {
  var query = azure.TableQuery
    .select('PartitionKey', 'RowKey', 'value')
    .from(acctsTable)
    .where('PartitionKey eq ? and RowKey ne ?', aid, acctRowKey);
  tableService.queryEntities(query, callback);
}

// callback(error, entity)
function getAttributes(aid, callback) {
  getAttributesArray(aid, function(error, attrs) {
    if (error) {
      console.error(error);
      callback(error, []);
      return;
    }
    var attributes = {};
    for (var i = 0; i < attrs.length; i++)
      attributes[attrs[i].RowKey] = attrs[i].value;
    callback(error, attributes);
  });
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
function putAttribute(aid, name, value, callback) {
  var attr = {
    PartitionKey: aid,
    RowKey: name,
    value: value
  };
  tableService.insertOrReplaceEntity(acctsTable, attr, callback);
}

// callback(error)
function delAttribute(aid, name, callback) {
  var attr = {
    PartitionKey: aid,
    RowKey: name
  };
  tableService.deleteEntity(acctsTable, attr, callback);
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
    if (error) {
      console.error(error);
      res.send('Account not found!', 404);
    }
    else
      res.json(acct);
  });
});

server.post('/:aid/Account', function(req, res) {
  addAccount(req, function(error) {
    if (error) {
      console.error(error);
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
      console.error(error);
      res.send('Account not found!', 404);
    }
    else {
      res.json(req.body);
    }
  });
});

server.del('/:aid/Account', function(req, res) {
  getAttributesArray(req.params.aid, function(error, attrs) {
    if (error) {
      console.error(error);
      res.send('Account not found', 404);
      return;
    }
    deleteAccount(req.params.aid, attrs, function(error) {
      if (error) {
        console.error(error);
        res.send(500);
      }
      else
        res.send(204);
    });
  });
});

server.get('/:aid/Attributes(:name)', function(req, res) {
  getAttributes(req.params.aid, function(error, attrs) {
    if (error) {
      console.error(error);
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
    if (error) {
      console.error(error);
      res.send("Account doesn't exist!", 404);
    }
    else
      res.json({ name: name, value: value });
  });
});
  

server.del('/:aid/Attributes(:name)', function(req, res) {
  // This is obviously extremely vulnerable to a JS injection,
  // but this is just code for an internal demo with fake users
  // so I'm not going to bother with sanitization.
  var name = eval('id' + req.params.name);
  delAttribute(req.params.aid, name, function(error) {
    if (error) {
      console.error(error);
      res.send('Attribute could not be found', 404);
    }
    else {
      res.send(204);
    }
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
      console.error(err);
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
      if (error) {
        console.error(error);
        res.send('Error communicating with Azure', 500);
      }
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
      console.error(error);
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'account_home.html'), function(err, data) {
      if (err) {
        console.error(err);
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
      console.error(error);
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'edit_account.html'), function(err, data) {
      if (err) {
        console.error(err);
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
      console.error(error);
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'add_attr.html'), function(err, data) {
      if (err) {
        console.error(err);
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
      console.error(error);
      res.send("Account not found!", 404);
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'del_attr.html'), function(err, data) {
      if (err) {
        console.error(err);
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

/*
server.get('/about', function(_, res) {
  res.send('<h1>This page now exists!</h1>');
});
*/

server.listen(process.env.PORT || port, function() {
  console.log('Server listening');
});
