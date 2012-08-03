var request = require('request');
exports.hitme = function(test) {
  var target = (test.context && test.context.host) || 'localhost:12345';
  request('http://' + target, function(err, res, body) {
    test.equals(res.statusCode, 200, 'Expected 200 OK');
    test.done();
  });
};
