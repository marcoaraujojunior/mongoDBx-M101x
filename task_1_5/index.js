var mongodb = require('mongodb');

var uri = 'mongodb://mongo:27017/example';

var errorFound = function(error) {
    if (error) {
        console.log(error);
        process.exit(1);
    }
};

mongodb.MongoClient.connect(uri, function(error, db) {
    errorFound(error);

    db.collection('sample').insert({x: 1}, function(error, result) {
        errorFound(error);

        db.collection('sample').find().toArray(function(error, docs) {
            errorFound(error);

            console.log('Found docs:');
            docs.forEach(function(doc) {
                console.log(JSON.stringify(doc));
            });
            process.exit(0);
        });
    });
});
