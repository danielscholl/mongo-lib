const assert = require("assert");
const objectID = require('mongodb').ObjectID;

let mapToId  = function mapToId (obj) {
  if (obj && obj.id !== null) {
    obj.id = obj._id;
    delete obj._id;
  }
  return obj;
};

let mapTo_Id = function mapTo_Id (obj) {
  if (obj && obj.id !== null) {
    obj._id = objectID(obj.id);
    delete obj.id;
  }
  return obj;
};

const Collection = function (collection){
  let table = collection;

  table.first = function first (user, next) {
    let json = JSON.stringify(user);
    let criteria = JSON.parse(json);

    if(criteria.id) criteria = map_IDProperty(criteria);
    table.findOne(criteria, (err, doc) => next(err, mapToId(doc)));
  };

  table.exists = function exists (criteria, next) {
    if(criteria.id)  criteria = map_IDProperty(criteria);
    table.findOne(criteria, (err, item) => 
      next(err, item !== null));
  };

  table.query = function query (criteria, next) {
    table.find(criteria).toArray((err, items) => 
      next(err, items.map((item) => mapToId(item))));
  };

  table.paginationQuery = function paginationQuery (criteria, next) {
    table.find(criteria.query).limit(criteria.limit).skip(criteria.skip).toArray((err, items) => 
      next(err, items.map((item) => mapToId(item))));
  };

  table.length = function length (next) {
    table.find({}).toArray((err, items) => 
      next(err, items.length));
  };

  table.saveData = function saveData(thing, next){
    table.save(thing, (err, doc) => {
      table.findOne((thing), (err, doc) => 
        next(err, mapToId(doc)));
    });
  };

  table.updateOnly = function updateOnly (updates, id, next){
    if(updates.id) updates = map_IDProperty(updates);

    table.update({"_id": objectID(id)}, {$set: updates}, null, (err, writeResult) =>
      next(err, writeResult.result.ok === 1));
  };

  table.destroyAll = function destroyAll (next){
    table.find().toArray(function(err, items) {
      table.remove();
      next(err, items.length);
    });
  };

  table.destroy = function destroy (id, next) {
    let query = { _id: objectID(id) };
    table.findAndRemove(query, (err, items) => {
      table.findOne(query, (err, item) =>
        next(err, item === null));
    });
  };

  table.index = function index (att, next){
    collection.ensureIndex({att : 1});
    next(null, true);
  };

  table.groupquery = function groupquery(criteria, next) {
    table.aggregate([
      {
        $group: {
          _id: {
            date: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            entry: "$entry"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          entry: { "$push": { entry: "$_id.entry", count: "$count" } }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: 10 }], (err, result) => next(err, result));
};
  return table;
};

module.exports = Collection;
