(function() {
  var BSON, MongoCollection, Select, Validator, collections, v;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  BSON = require('mongodb').BSONPure;
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  collections = require('../collections');
  MongoCollection = exports.MongoCollection = collections.CollectionAbsLayer.extend4000({
    validator: v({
      db: 'instance',
      collection: v().or('string', 'instance')
    }),
    initialize: function() {
      this.collection = this.get('collection');
      if (this.collection.constructor === String) {
        return this.get('db').collection(this.collection, __bind(function(err, collection) {
          return this.set({
            collection: this.collection = collection
          });
        }, this));
      }
    },
    create: function(entry, callback) {
      return this.collection.insert(entry, callback);
    }
  });
}).call(this);
