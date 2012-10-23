(function() {
  var Backbone, ModelMixin, RemoteModel, Select, SubscriptionMan, SubscriptionMixin, Validator, decorate, decorators, helpers, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  Backbone = require('backbone4000');
  _ = require('underscore');
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  decorators = require('decorators');
  decorate = decorators.decorate;
  SubscriptionMan = require('subscriptionman').SubscriptionMan;
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
  ModelMixin = exports.ModelMixin = Backbone.Model.extend4000({
    initialize: function() {
      return this.models = {};
    },
    defineModel: function() {
      var definition, name, superclasses, _i;
      name = arguments[0], superclasses = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), definition = arguments[_i++];
      if (!(definition.defaults != null)) {
        definition.defaults = {};
      }
      definition.defaults.collection = this;
      definition.defaults.type = name;
      return this.models[name] = RemoteModel.extend4000.apply(RemoteModel, helpers.push(superclasses, definition));
    },
    resolveModel: function(entry) {
      if (this.models.length === 1) {
        return this.models[0];
      }
      if (entry.type) {
        return this.models[entry.type];
      }
    },
    findModels: function(pattern, limits, callback) {
      return this.find(pattern, limits, __bind(function(entry) {
        if (!(entry != null)) {
          return callback();
        } else {
          return callback(new (this.resolveModel(entry))(entry));
        }
      }, this));
    }
  });
  SubscriptionMixin = exports.SubscriptionMixin = Backbone.Model.extend4000({
    initialize: function() {
      return this.subscriptions = new SubscriptionMan();
    },
    subscribe: function() {
      return true;
    },
    unsubscribe: function() {
      return true;
    }
  });
}).call(this);
