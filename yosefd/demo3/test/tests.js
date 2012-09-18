var request = require('request');

exports.test1 = function(test) {
  var protocol = (test.context && test.context.protocol) || 'http://';
  var host = (test.context && test.context.host) || 'localhost:5000';
  var target = protocol + host;

  request(target, function(err, res) {
    test.ok(!err);
    test.equals(res.statusCode, 200, 'expecting 200');
    console.info('test1 done');
    test.done();
  });
}