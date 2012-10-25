(function() {
  var Backbone, RemoteModel, Select, Validator, decorate, decorators, helpers, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Backbone = require('backbone4000');
  _ = require('underscore');
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  decorators = require('decorators');
  decorate = decorators.decorate;
  RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000({
    validator: v({
      collection: 'instance'
    }),
    initialize: function() {
      this.when('collection', __bind(function(collection) {
        this.unset('collection');
        return this.collection = collection;
      }, this));
      this.when('id', __bind(function(id) {
        this.collection.subscribechanges({
          id: id
        }, this.remoteChange.bind(this));
        return this.on('change', this.changed);
      }, this));
      if (this.get('id')) {
        return this.changes = {};
      } else {
        return this.changes = helpers.hashmap(this.attributes, function() {
          return true;
        });
      }
    },
    remoteChange: function(change) {
      switch (change.action) {
        case 'update':
          return this.set(change.update, {
            silent: true
          });
      }
    },
    changed: function(model, data) {
      var change;
      change = model.changedAttributes();
      delete change.id;
      return _.extend(this.changes, helpers.hashmap(change, function() {
        return true;
      }));
    },
    "export": function(realm, attrs) {
      return helpers.hashfind(attrs, __bind(function(value, property) {
        return this.attributes[property];
      }, this));
    },
    exportchanges: function(realm) {
      var ret;
      ret = this["export"](realm, this.changes);
      this.changes = {};
      return ret;
    },
    update: function(data) {
      return this.set(data);
    },
    flush: function(callback) {
      return this.flushnow(callback);
    },
    flushnow: function(callback) {
      var changes, id;
      changes = this.exportchanges('store');
      if (helpers.isEmpty(changes)) {
        callback();
      }
      if (!(id = this.get('id'))) {
        return this.collection.create(changes, __bind(function(err, id) {
          this.set('id', id);
          return callback(err, id);
        }, this));
      } else {
        return this.collection.update({
          id: id
        }, changes, callback);
      }
    },
    remove: function(callback) {
      var id;
      this.trigger('remove');
      if (id = this.get('id')) {
        return this.collection.remove({
          id: id
        }, callback);
      } else {
        return callback();
      }
    }
  });
}).call(this);
