var request = require('request');

console.info('loading demo3 test');

exports.test1 = function(test) {
  console.info('running test1', test);

  //var host = (test.context && text.context.host) || 'localhost:5000';

  console.info('context', test.context.protocol + test.context.host);

  var protocol = test.context && test.context.protocol) || 'http://';
  var host = (test.context && test.context.host) || 'localhost:5000';

  console.info('target', protocol + host);

  test.done();

  // request('http://' + target, function(err, res) {
  //   console.info('err:', err);
  //   test.equals(res.statusCode, 200, 'expecting 200');
  //   test.done();
  // });
}