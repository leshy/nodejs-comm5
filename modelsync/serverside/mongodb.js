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
    patternIn: function(pattern) {
      var _ref;
      pattern = _.extend({}, pattern);
      if (pattern.id != null) {
        pattern._id = pattern.id;
        delete pattern.id;
      }
      if (((_ref = pattern._id) != null ? _ref.constructor : void 0) === String) {
        pattern._id = new BSON.ObjectID(pattern._id);
      }
      return pattern;
    },
    patternOut: function(pattern) {
      if (!(pattern != null)) {
        return pattern;
      }
      pattern = _.extend({}, pattern);
      if (pattern._id != null) {
        pattern.id = String(pattern._id);
        delete pattern._id;
      }
      return pattern;
    },
    find: function(pattern, limits, callback) {
      return this.collection.find(this.patternIn(pattern), limits, __bind(function(err, cursor) {
        return cursor.each(__bind(function(err, entry) {
          return callback(this.patternOut(entry));
        }, this));
      }, this));
    },
    findOne: function(pattern, callback) {
      return this.collection.findOne(this.patternIn(pattern), __bind(function(err, entry) {
        return callback(this.patternOut(entry));
      }, this));
    },
    remove: function(pattern, callback) {
      return this.collection.remove(this.patternIn(pattern), callback);
    },
    update: function(pattern, update, callback) {
      return this.collection.update(this.patternIn(pattern), {
        '$set': update
      }, callback);
    }
  });
  MongoCollectionNode = exports.MongoCollectionNode = MongoCollection.extend4000(collections.ModelMixin, collections.SubscriptionMixin, collections.CollectionExposer);
}).call(this);
