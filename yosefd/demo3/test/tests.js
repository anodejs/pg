var request = require('request');

exports.test1 = function(test) {
  var target = (test.context && text.context.host) || 'localhost:5000';

  request('http://' + target, function(err, res) {
    test.ok(!err);
    test.equals(res.statusCode, 200, 'expecting 200');
    test.done();
  });
}