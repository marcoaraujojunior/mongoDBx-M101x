var status = require('http-status');

module.exports = function () {
    var one = function (property, res, error, result) {
        if (error) {
            return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({ error : error.toString() });
        }
        if (!result) {
            return res.
                status(status.NOT_FOUND).
                json({ error: 'Not Found'});
            }

        var json = {};
        json[property] = result;
        res.json(json);
    };

    var many = function (property, res, error, result) {
        if (error) {
            return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({ error : error.toString() });
        }
        var json = {};
        json[property] = result;
        res.json(json);
    };

    return {
        one : one,
        many : many,
    };
}

