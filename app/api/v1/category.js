var handleResponse = rootRequire('lib/HandleResponse');
var handle = handleResponse();

module.exports = function (wagner, api) {
    api.get('/category/id/:id', wagner.invoke(function(Category) {
        return function (req, res) {
            Category.findOne({ _id: req.params.id},  handle.one.bind(null, 'category', res));
        };
    }));

    api.get('/category/parent/:id', wagner.invoke(function (Category){
        return function (req, res) {
            Category.
                find({ parent: req.params.id}).
                sort({ _id: 1}).
                exec(handle.many.bind(null, 'categories', res));
        };
    }));

    return api;
};

