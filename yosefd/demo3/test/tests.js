var request = require('request');

exports.test1 = function(test) {
  var target = (test.context && text.context.host) || 'localhost:5000';

  console.info('target', target);

  request('http://' + target, function(err, res) {
    console.info('err:', err);
    test.equals(res.statusCode, 200, 'expecting 200');
    test.done();
  });
}