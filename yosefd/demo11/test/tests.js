var request = require('request');

function target(test) {
  var protocol = (test.context && test.context.protocol) || 'http://';
  var host = (test.context && test.context.host) || 'localhost:5000';
  return protocol + host;
}

exports.test1 = function(test) {
  request(target(test), function(err, res) {
    test.ok(!err);
    test.equals(res.statusCode, 200, 'expecting 200');
    console.info('test1 done');
    test.done();
  });
}

exports.test2 = function(test) {
  request(target(test) + '/bad', function(err, res) {
    test.ok(!err);
    test.equals(res.statusCode, 403, 'expecting 403');
    console.info('test2 done');
    test.done();
  });
}