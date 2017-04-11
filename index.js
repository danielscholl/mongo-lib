const MongoClient = require('mongodb').MongoClient;
const Database = require('mongodb').Db;
const Server = require('mongodb').Server; 
const assert = require("assert");
const async = require("async");

const Config = require('./lib/models').Config;
const Collection = require("./lib/collection");

const Client = function () {
  let self = this;
  let config, db;

  const connect = function connect (args, next) {
    config = new Config(args);
    openConnection((err, result) => {
      next(err, result);
    });
  };

  const openConnection = function openConnection (next) {
    MongoClient.connect(config.url(), (err, db) => {
      assert.equal(null, err);

      self.db = db;
      self.db.collections((err, result) => {
        if(!err) {
          const collections = result.filter((collectionName) => collectionName !== 'system.indexes');
          collections.forEach(row => {
            self[row.collectionName] = new Collection(row);
          });
        }
        next (err, self);
      });
    });
  }

  const install = function install (tables, next){
    assert.ok(tables && tables.length > 0, "Be sure to set the tables array on the config");
    async.each(tables, (item, callback) => { // Create a Collection in Database
      self.db.createCollection(item, (err) => {
        assert.ok(err === null, err);

        callback(err, err === null);
      });
    }, (err) => { // When completed Check Errors and Close DB
        assert.ok(err === null, err);
        self.close(() =>{
          openConnection((err, result) => {
            next(err, result);
          });
        });
      }
    );
  };

  const dropDb = function dropDb (dbName, next) {
    self.db.dropDatabase((err, result) => {
      assert.ok(err === null, err);

      next(err, result);
    });
  };

  const collectionExists = function collectionExists (collection, next) {
    self.db.collections((err, collections) => {
      assert.ok(err === null, err);

      const list = collections.filter((row) => row.collectionName === collection);
      next(err, list.length === 1);
    });
  };

  const dbExists = function dbExists (dbName, next) {
    self.db.admin().listDatabases((err, db) => {
      assert.ok(err === null, err);

      const list = db.databases.filter((db) => db.name === dbName);
      next(err, list.length === 1);
    });
  };

  /////////////////////////////////////////

  self.connect = connect;
  self.close = (next) => self.db.close(next);
  self.install = install;
  self.dbExists = dbExists;
  self.collectionExists = collectionExists;
  self.dropDb = dropDb;
  return self;
};

module.exports = new Client();
