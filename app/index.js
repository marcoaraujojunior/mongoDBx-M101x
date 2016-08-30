global.rootRequire = function(name) {
    return require(require('path').dirname(require.main.filename) + '/' + name);
}

var express = require('express');
var wagner = require('wagner-core');

rootRequire('models/models')(wagner);
rootRequire('services/dependencies')(wagner);

var app = express();

wagner.invoke(rootRequire('services/auth'), { app: app });

app.use('/api/v1', rootRequire('api/v1/api')(wagner));

app.listen(3000);
console.log('Listening on port 3000!');
