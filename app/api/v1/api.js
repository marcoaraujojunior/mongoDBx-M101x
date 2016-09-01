var express = require('express');

module.exports = function(wagner) {
    var api = express.Router();

    api = rootRequire('api/v1/cart')(wagner, api);
    return api;
};
