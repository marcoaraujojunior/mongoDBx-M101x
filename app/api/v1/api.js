var bodyparser = require('body-parser');
var express = require('express');

module.exports = function(wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    api = rootRequire('api/v1/cart')(wagner, api);
    api = rootRequire('api/v1/user')(wagner, api);
    api = rootRequire('api/v1/product')(wagner, api);
    api = rootRequire('api/v1/category')(wagner, api);
    return api;
};
