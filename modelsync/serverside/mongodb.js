(function() {
  var BSON, Backbone, MongoCollection, MongoCollectionNode, Select, Validator, collections, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  BSON = require('mongodb').BSONPure;
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  collections = require('../collections');
  Backbone = require('backbone4000');
  _ = require('underscore');
  MongoCollection = exports.MongoCollection = Backbone.Model.extend4000({
    validator: v({
      db: 'instance',
      collection: v().or('string', 'instance')
    }),
    initialize: function() {
      this.collection = this.get('collection');
      if (this.collection.constructor === String) {
        this.get('db').collection(this.collection, __bind(function(err, collection) {
          return this.set({
            collection: this.collection = collection
          });
        }, this));
      }
      if (!this.get('name')) {
        return this.set({
          name: this.collection.collectionName
        });
      }
    },
    create: function(entry, callback) {
      entry = _.extend({}, entry);
      return this.collection.insert(entry, function(err, data) {
        if ((data != null ? data[0]._id : void 0)) {
          data = String(data[0]._id);
        }
        return callback(err, data);
      });
    },
    fixpattern: function(pattern) {
      var _ref;
      if (pattern.id != null) {
        pattern._id = pattern.id;
        delete pattern.id;
      }
      if (((_ref = pattern._id) != null ? _ref.constructor : void 0) === String) {
        pattern._id = new BSON.ObjectID(pattern._id);
      }
      return pattern;
    },
    find: function(pattern, limits, callback) {
      return this.collection.find(this.fixpattern(pattern), limits, function(err, cursor) {
        return cursor.each(function(err, entry) {
          return callback(entry);
        });
      });
    },
    remove: function(pattern, callback) {
      return this.collection.remove(this.fixpattern(pattern), callback);
    },
    update: function(pattern, update, callback) {
      return this.collection.update(this.fixpattern(pattern), update, callback);
    }
  });
  MongoCollectionNode = exports.MongoCollectionNode = MongoCollection.extend4000(collections.CollectionExposer);
}).call(this);
