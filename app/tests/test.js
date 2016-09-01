global.rootRequire = function(name) {
    return require(require('path').dirname(__filename) + '/../' + name);
}

var assert = require('assert');
var express = require('express');
var wagner = require('wagner-core');
var superagent = require('superagent');
var _ = require('underscore');
var status = require('http-status');

var URL_ROOT = 'http://localhost:3000';
var PRODUCT_ID = '000000000000000000000001';

describe('Tests API', function(){
    var server;
    var Category;
    var Product;
    var User;

    before(function(){
        var app = express();

        //Bootstrap server
        models = rootRequire('models/models')(wagner);
        dependencies = rootRequire('services/dependencies')(wagner);

        // Make Category model available in tests
        var deps = wagner.invoke(function(Category, Product, Stripe, User) {
            return {
                Category: Category,
                Product: Product,
                Stripe: Stripe,
                User: User,
            };
        });

        Category = deps.Category;
        Product = deps.Product;
        Stripe = deps.Stripe;
        User = deps.User;

        app.use(function(req, res, next) {
            User.findOne({}, function(error, user) {
                assert.ifError(error);
                req.user = user;
                next();
            });
        });


        app.use(rootRequire('api/v1/api')(wagner));
        server = app.listen(3000);
    });

    after(function(){
        server.close();
    });

    beforeEach(function(done) {
        Category.remove({}, function(error) {
            assert.ifError(error);
            Product.remove({}, function(error) {
                assert.ifError(error);
                User.remove({}, function (error) {
                    assert.ifError(error);
                    done();
                });
            });
        });
    });

    beforeEach(function(done) {
        var categories = [
            { _id: 'Eletronics'},
            { _id: 'Phones', parent: 'Eletronics'},
            { _id: 'Laptops', parent: 'Eletronics'},
            { _id: 'Bacon'}
        ];

        var products = [
            {
                _id: PRODUCT_ID,
                name: 'LG G4',
                category: { _id: 'Phones', ancestors: ['Eletronics', 'Phones']},
                price: {
                    amount: 300,
                    currency: 'USD'
                }
            },
            {
                name: 'Asus Zenbook Prime',
                category: { _id: 'Laptops', ancestors: ['Eletronics', 'Laptops']},
                price: {
                    amount: 2000,
                    currency: 'USD'
                }
            },
            {
                name: 'Flying Pigs Farm Pasture Raised Pork Bacon',
                category: { _id: 'Bacon', ancestors: ['Bacon']},
                price: {
                    amount: 20,
                    currency: 'USD'
                }
            }
        ];

        var users = [{
            profile: {
                username: 'gabriel',
                picture: 'http://www.gabrieldeveloper.com.br/templates/gabriel/css/img/gabriel-developer.png'
            },
            data: {
                oauth: 'invalid',
                cart: []
            }
        }];

        Category.create(categories, function(error) {
            assert.ifError(error);
            Product.create(products, function(error) {
                assert.ifError(error);
                User.create(users, function(error) {
                    assert.ifError(error);
                    done();
                });
            });
        });
    });

    describe('Cart API', function(){
        it('can check out', function(done) {
            var url = URL_ROOT + '/checkout';

            User.findOne({}, function(error, user) {
                assert.ifError(error);
                user.data.cart = [{ product: PRODUCT_ID, quantity: 1}];
                user.save(function(error) {
                    assert.ifError(error);

                    superagent.
                        post(url).
                        send({
                            stripeToken: {
                                number: '4242424242424242',
                                exp_month: 12,
                                exp_year: 2017,
                                cvc: '123'
                            }
                        }).
                        end(function(error, res) {
                            assert.ifError(error);

                            assert.equal(res.status, 200);
                            var result;
                            assert.doesNotThrow(function (){
                                result = JSON.parse(res.text);
                            });

                            assert.ok(result.id);
                            Stripe.charges.retrieve(result.id, function(error, charge) {
                                assert.ifError(error);
                                assert.ok(charge);
                                assert.equal(charge.amount, 300 * 100);
                                done();
                            });
                        });
                        done();
                });
            });
        });
    });

    describe('User API', function(){
       it('can save users cart', function (done) {
            var url = URL_ROOT + '/me/cart';
            superagent.
                put(url).
                send({
                    data: {
                        cart: [{ product: PRODUCT_ID, quantity: 1}]
                    }
                }).
                end(function (error, res) {
                    assert.ifError(error);
                    assert.equal(res.status, status.OK);
                    User.findOne({}, function (error, user){
                        assert.ifError(error);
                        assert.equal(user.data.cart.length, 1);
                        assert.equal(user.data.cart[0].product, PRODUCT_ID);
                        assert.equal(user.data.cart[0].quantity, 1);
                        done();
                    });
                });
       });

        it('can load users cart', function (done) {
            var url = URL_ROOT + '/me';

            User.findOne({}, function (error, user) {
                assert.ifError(error);
                user.data.cart = [{ product: PRODUCT_ID, quantity: 1}];
                user.save(function(error) {
                    assert.ifError(error);

                    superagent.get(url, function (error, res) {
                        assert.ifError(error);

                        assert.equal(res.status, status.OK);
                        var result;
                        assert.doesNotThrow(function(){
                            result = JSON.parse(res.text).user;
                        });

                        assert.equal(result.data.cart.length, 1);
                        assert.equal(result.data.cart[0].product.name, 'LG G4');
                        assert.equal(result.data.cart[0].quantity, 1);
                        done();
                    });
                });
            });
        });
    });

    describe('Product API', function(){

        it('can search by text', function (done) {
            var url = URL_ROOT + '/product/text/g4';

            superagent.get(url, function (error, res) {
                assert.ifError(error);
                assert.equal(res.status, status.OK);

                var results;
                assert.doesNotThrow(function (){
                    results = JSON.parse(res.text).products;
                });

                assert.equal(results.length, 1);
                assert.equal(results[0]._id, PRODUCT_ID);
                assert.equal(results[0].name, 'LG G4');
                done();
            });
        });

        it('can load a product by id', function (done) {
            var url = URL_ROOT + '/product/id/' + PRODUCT_ID;
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;

                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });

                assert.ok(result);
                assert.equal(result.product._id, PRODUCT_ID);
                assert.equal(result.product.name, 'LG G4');
                done();
            });
        });

        it('can load all products in a category with sub-categories', function(done) {
            var url = URL_ROOT + '/product/category/Eletronics';
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.equal(result.products.length, 2);
                // Should be in ascending order by name
                assert.equal(result.products[0].name, 'Asus Zenbook Prime');
                assert.equal(result.products[1].name, 'LG G4');

                // Sort by price, ascending
                var url = URL_ROOT + '/product/category/Eletronics?price=1';
                superagent(url, function(error, res) {
                    assert.ifError(error);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });
                    assert.equal(result.products.length, 2);

                    //Should be in acending order by precco
                    assert.equal(result.products[0].name, 'LG G4');
                    assert.equal(result.products[1].name, 'Asus Zenbook Prime');
                    done();
                });
            });
        });
    });


    describe('Category API', function(){
        it('can load a category by id', function (done) {
            var url = URL_ROOT + '/category/id/Eletronics';

            //Make an HTTP request to localhost:3001/category/id/letronics
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;

                // And make sure we got { _id: 'Eletronics' } back
                assert.doesNotThrow(function (){
                    result = JSON.parse(res.text);
                });
                assert.ok(result.category);
                assert.equal(result.category._id, 'Eletronics');
                done();
            });
        });

        it('can load all categories that have a certain parent', function(done) {
            var url = URL_ROOT + '/category/parent/Eletronics';

            // Make an HTTP request to localhost:3001/category/parent/Eletronics
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;

                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.equal(result.categories.length, 2);

                assert.equal(result.categories[0]._id, 'Laptops');
                assert.equal(result.categories[1]._id, 'Phones');
                done();
            });
        });
    });
});

