var rinuts = require('rinuts-nodeunitDriver'); // use the rinuts nodeunit driver
rinuts.listen(require('./tests'), process.env.PORT || 7000); // bind the rinuts server to the http endpoint