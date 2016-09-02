var handleResponse = rootRequire('lib/HandleResponse');
var handle = handleResponse();

module.exports = function (wagner, api) {
    api.get('/product/text/:query', wagner.invoke(function (Product) {
        return function (req, res) {
            Product.
                find(
                    { $text : { $search : req.params.query}},
                    { score : { $meta : 'textScore'}}).
                sort({ score: { $meta : 'textScore'}}).
                limit(10).
                exec(handle.many.bind(null, 'products', res));
        };
    }));

    api.get('/product/id/:id', wagner.invoke(function(Product) {
        return function (req, res) {
            Product.findOne({ _id: req.params.id}, handle.one.bind(null, 'product', res));
        };
    }));

    api.get('/product/category/:id', wagner.invoke(function(Product) {
        return function (req, res) {
            var sort = { name: 1};
            if (req.query.price === "1") {
                sort = {'internal.approximatePriceUSD' : 1};
            } else if (req.query.price === "-1") {
                sort = {'internal.approximatePriceUSD' : -1};
            }

            Product.
                find({ 'category.ancestors': req.params.id }).
                sort(sort).
                exec(handle.many.bind(null, 'products', res));
        };
    }));

    return api;
}

