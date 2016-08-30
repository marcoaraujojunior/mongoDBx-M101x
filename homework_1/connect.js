var mongodb = require('mongodb');
var uri = 'mongodb://mongo:27017/movies';

module.exports = function(callback) {
  mongodb.MongoClient.connect(uri, callback);
};
