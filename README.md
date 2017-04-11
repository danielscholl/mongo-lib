# Wrapper Layer for MongoDB

A simple wrapper for MongoDB.

__Functionality:__

- Query, which returns an array
- First, Exists
- Save, which upserts a record
- Automatic table/db config
- DB Manipulation (Create/Drop)


## Usage

Install using

```
npm install https://github.com/danielscholl/mongo-lib --save
```

To use this in your code, just configure what you need:

```javascript
var db = require("nongo-lib");
db.connect({db : "test"}, (err,db) => {

  //you now have access to all of your tables as properties on your db variable:
  //so, assume there's a table called "foo" in your db...
  db.foo.save({name : "Mike"}, (err,saved) => {

    //output the generated ID
    console.log(saved.id);
  });

});
```

Each table on your DB object is a full-blown Mongo collection, so you can step outside the abstraction at any point:

```javascript
db.connect({db : "test"}, (err,db) => {

  //this is a ReQL query
  db.foo.eqJoin('bar_id', db.bar).run(conn, function(err,cursor){

    //run the joined action and do something interesting
    cursor.toArray(function(err,array){
      //use the array...

      //be sure to close the connection!
      conn.close();
    });

  });
});

```

In addition you can do all kinds of fun things, like...

```javascript
//installation of the DB and tables
db.connect({db : "test"}, (err, db) => {
  db.install(['foo', 'bar'], (err,result) => {
    //tables should be installed now...
  });
});

//add a secondary index
db.connect({db : "test"}, (err,db) => {
  db.foo.index("email", function(err, indexed){
    //indexed == true;
  });
});
```

## Basic Queries

```javascript
db.connect({db : "test", (err, db) => {

  db.foo.query({category : "beer"}, (err, beers) => {
    //beers is an array, so have at it
  });

  db.foo.first({email : "john.doe@mail.com"}, (err, john) => {
    //hi John
  });

  db.foo.exists({name : "bill"}, (err, exists) => {
    //exists will tell you if it's there
  });

  db.foo.destroy({id : "some-id"}, (err, destroyed) => {
    //destroyed will be true if something was deleted
  });

  db.foo.destroyAll((err, destroyed) => {
    //destroyed is the count of records whacked
  });

  db.foo.updateOnly({name : "Stevie"}, "some-id", (err, result) => {
    //save will do a full swap of the document, updateOnly will partially update
    //a document so you need to pass the id along
    //result will be true if an update happened
  });

});

```