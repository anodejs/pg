var request = require('request');
exports.hitme = function(test) {
  var target = (test.context && test.context.host) || 'localhost:5000'; // to run locally
  request('http://' + target, function(err, res, body) {
    test.equals(res.statusCode, 200, "expecting 200 OK");
    test.done();
  });
};
