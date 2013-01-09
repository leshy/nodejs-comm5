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
    depthfirst: function(callback, target) {
      var key, response;
      if (target == null) {
        target = this.attributes;
      }
      if (target.constructor === Object || target.constructor === Array) {
        target = _.clone(target);
        for (key in target) {
          target[key] = this.depthfirst(callback, target[key]);
        }
        return target;
      } else if (response = callback(target)) {
        return response;
      } else {
        return target;
      }
    },
    initialize: function() {
      this.when('collection', __bind(function(collection) {
        this.unset('collection');
        return this.collection = collection;
      }, this));
      this.when('id', __bind(function(id) {
        this.collection.subscribechanges({
          id: id
        }, this.remoteChangeReceive.bind(this));
        return this.on('change', this.remoteChangePropagade.bind(this));
      }, this));
      if (this.get('id')) {
        return this.changes = {};
      } else {
        return this.changes = helpers.hashmap(this.attributes, function() {
          return true;
        });
      }
    },
    remoteChangeReceive: function(change) {
      switch (change.action) {
        case 'update':
          return this.set(change.update, {
            silent: true
          });
      }
    },
    remoteChangePropagade: function(model, data) {
      var change;
      change = model.changedAttributes();
      delete change.id;
      return _.extend(this.changes, helpers.hashmap(change, function() {
        return true;
      }));
    },
    remoteCallPropagade: function(name, args, callback) {
      return this.collection.fcall(name, args, {
        id: this.id
      }, callback);
    },
    remoteCallReceive: function(name, args, callback) {
      return this[name].apply(this, args.concat(callback));
    },
    "export": function(realm, attrs) {
      return helpers.hashfilter(attrs, __bind(function(value, property) {
        return this.attributes[property];
      }, this));
    },
    exportreferences: function() {
      var _export;
      _export = function(model) {
        return {
          _r: model.get('id'),
          _c: model.collection.name()
        };
      };
      return this.depthfirst(function(val) {
        if (val instanceof RemoteModel) {
          return _export(val);
        } else {
          return val;
        }
      });
    },
    importreferences: function(attributes) {
      var refcheck, _import;
      _import = function(reference) {
        return true;
      };
      refcheck = v({
        _r: "String",
        _c: "String"
      });
      return this.depthfirst(function(val) {
        return refcheck.feed(val, function(err, data) {
          if (!err) {}
        });
      });
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
      changes = this.exportreferences(changes);
      if (helpers.isEmpty(changes)) {
        helpers.cbc(callback);
      }
      if (!(id = this.get('id'))) {
        return this.collection.create(changes, __bind(function(err, id) {
          this.set('id', id);
          return helpers.cbc(callback, err, id);
        }, this));
      } else {
        return this.collection.update({
          id: id
        }, changes, callback);
      }
    },
    fetch: function(callback) {
      return true;
    },
    del: function(callback) {
      var id;
      this.trigger('del', this);
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
