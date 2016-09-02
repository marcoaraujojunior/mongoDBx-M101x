var status = require('http-status');
var handleResponse = rootRequire('lib/HandleResponse');
var handle = handleResponse();

module.exports = function (wagner, api) {
    api.get('/me', function (req, res){
        if (!req.user) {
            return res.
                status(status.UNAUTHORIZED).
                json({ error: "Not logged in"});
        }

        req.user.populate(
            { path: 'data.cart.product', model: 'Product'},
            handle.one.bind(null, 'user', res)
        );
    });
    return api;
}

