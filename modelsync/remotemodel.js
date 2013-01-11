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
    asyncDepthfirst: function(changef, callback, clone, target) {
      var bucket, cb, key, result;
      if (clone == null) {
        clone = false;
      }
      if (target == null) {
        target = this.attributes;
      }
      if (target.constructor === Object || target.constructor === Array) {
        if (clone) {
          target = _.clone(target);
        }
        bucket = new helpers.parallelBucket();
        for (key in target) {
          cb = bucket.cb();
          result = function(err, data) {
            target[key] = data;
            return cb(err, data);
          };
          this.asyncDepthfirst(changef, result, clone, target[key]);
        }
        return bucket.done(function(err, data) {
          return callback(err, target);
        });
      } else {
        return helpers.forceCallback(changef, target, callback);
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
    exportReferences: function(data, callback) {
      var _matchf;
      _matchf = function(value, callback) {
        var id;
        if (value instanceof RemoteModel) {
          if (id = value.get('id')) {
            callback(void 0, {
              _r: id,
              _c: value.collection.name()
            });
          } else {
            value.flush(function(err, id) {});
            if (err) {
              callback(err, id);
            } else {
              callback(void 0, {
                _r: id,
                _c: value.collection.name()
              });
            }
          }
        } else {
          return value;
        }
      };
      return this.asyncDepthfirst(_matchf, callback, true, data);
    },
    importReferences: function(data, callback) {
      var refcheck, _import, _matchf;
      _import = function(reference) {
        return true;
      };
      refcheck = v({
        _r: "String",
        _c: "String"
      });
      _matchf = function(value, callback) {
        refcheck.feed(value, function(err, data) {});
        if (err) {
          callback(void 0, value);
        } else {
          callback(void 0, "MATCHED");
        }
      };
      return this.asyncDepthfirst(_matchf, callback, false, data);
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
      var changes;
      changes = this.exportchanges('store');
      return this.exportReferences(changes, __bind(function(err, changes) {
        var id;
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
      }, this));
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
