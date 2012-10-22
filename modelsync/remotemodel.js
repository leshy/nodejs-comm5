(function() {
  var Backbone, RemoteModel, RemoteModelMixin, Select, Validator, async, decorate, decorators, helpers, v, _;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Backbone = require('backbone4000');
  _ = require('underscore');
  decorators = require('decorators');
  decorate = decorators.decorate;
  async = require('async');
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000({
    validator: v({
      collection: 'instance'
    }),
    initialize: function() {
      return this.collection = this.get('collection');
    }
  });
  RemoteModelMixin = exports.RemoteModelMixin = Backbone.Model.extend4000({
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
}).call(this);
