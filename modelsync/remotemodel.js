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
      this.collection = this.get('collection');
      return this.when('id', __bind(function() {
        this.collection.subscribe({
          id: this.id
        });
        return this.on('change', this.changed);
      }, this));
    },
    changed: function(model, data) {
      return this.flush();
    },
    "export": function(realm) {
      return _.omit(this.attributes, 'collection');
    },
    update: function(data) {
      return this.set(data);
    },
    flush: decorate(decorators.MakeDecorator_Throttle({
      throttletime: 1
    }), function(callback) {
      return this.flushnow(callback);
    }),
    flushnow: function(callback) {
      var id;
      if (!(id = this.get('id'))) {
        return this.collection.create(this["export"]('store'), __bind(function(err, id) {
          this.set('id', id);
          return callback();
        }, this));
      } else {
        return this.collection.update({
          id: id
        }, this["export"]('store'), callback);
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
