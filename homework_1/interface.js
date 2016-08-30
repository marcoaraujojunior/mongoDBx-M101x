var stopIfError = function(error) {
    if (error) {
        console.log(error);
        process.exit(1);
    }
}
/*
 *  Inserts "doc" into the collection "movies".
 */
exports.insert = function(db, doc, callback) {
  // TODO: implement

  db.collection('movies').insert(doc, function(error, result) {
    stopIfError(error);
  });
  callback(null);
};

/*
 *  Finds all documents in the "movies" collection
 *  whose "director" field equals the given director,
 *  ordered by the movie's "title" field. See
 *  http://mongodb.github.io/node-mongodb-native/2.0/api/Cursor.html#sort
 */
exports.byDirector = function(db, director, callback) {
  // TODO: implement
  var query = {
    'director' : director
  };
  var sortBy = {
      'title': 1
  };
  db.collection('movies').find(query).sort(sortBy).toArray(function(error, docs) {
    stopIfError(error);
    callback(null, docs);
  });
};
