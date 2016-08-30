var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
  mongoose.connect('mongodb://mongo:27017/test');

  wagner.factory('db', function() {
    return mongoose;
  });

  var Category =
    mongoose.model('Category', rootRequire('models/category'), 'categories');
  var User =
    mongoose.model('User', rootRequire('models/user'), 'users');

  var models = {
    Category: Category,
    User: User
  };

  // To ensure DRY-ness, register factories in a loop
  _.each(models, function(value, key) {
    wagner.factory(key, function() {
      return value;
    });
  });

  wagner.factory('Product', rootRequire('models/product'));

  return models;
};
