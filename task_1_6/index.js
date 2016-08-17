var mongodb = require('mongodb');

var uri = 'mongodb://mongo:27017/example';

var errorFound = function(error) {
    if (error) {
        console.log(error);
        process.exit(1);
    }
};

var insertMongo = function(error, db) {
    errorFound(error);

    var doc = {
        title: 'Jaws',
        year: 1975,
        director: 'Steven Spielberg',
        rating: 'PG',
        ratings: {
            critics: 80,
            audience: 97
        },
        screenplay: [ 'Peter Benchley', 'Carl Gotlieb' ]
    };

    db.collection('movies').insert(doc, function(error, result) {
        errorFound(error);

        var query = { year: 1975 , rating: 'PG' };
        db.collection('movies').find(query).toArray(showDocs);
    });
};

mongodb.MongoClient.connect(uri, insertMongo);

var showDocs = function(error, docs) {
    errorFound(error);

    console.log('Found docs:');
    docs.forEach(function(doc) {
        console.log(JSON.stringify(doc));
    });
    process.exit(0);
};

