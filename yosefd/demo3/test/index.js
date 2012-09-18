var renuts = require('renuts-nodeunitDriver');
renuts.listen(require('./tests'), process.env.PORT || 7000);