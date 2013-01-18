(function() {
  var Backbone, Permission, RemoteModel, Select, Validator, async, decorate, decorators, helpers, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Backbone = require('backbone4000');
  _ = require('underscore');
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  decorators = require('decorators');
  decorate = decorators.decorate;
  async = require('async');
  /*
  definePermissions = (f) ->
      p = 
  
      permissions = {}
      def = (name, permission)
      
      
      f def, _.clone(some_standard_permissions_set)
  */
  Permission = exports.Permission = Validator.ValidatedModel.extend4000({
    validator: v({
      match: 'Instance',
      chew: 'Function'
    }),
    initialize: function() {
      this.matchvalidator = this.get('match');
      return this.chew = this.get('chew');
    },
    match: function(realm, callback) {
      return this.matchvalidator.feed(realm, callback);
    }
  });
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
        this.id = id;
        this.collection.subscribechanges({
          id: id
        }, this.remoteChangeReceive.bind(this));
        return this.on('change', this.localChangePropagade.bind(this));
      }, this));
      this.importReferences(this.attributes, __bind(function(err, data) {
        return this.attributes = data;
      }, this));
      if (this.get('id')) {
        return this.changes = {};
      } else {
        return this.changes = helpers.hashmap(this.attributes, function() {
          return true;
        });
      }
    },
    reference: function(id) {
      if (id == null) {
        id = this.get('id');
      }
      return {
        _r: id,
        _c: this.collection.name()
      };
    },
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
    asyncDepthfirst: function(changef, callback, clone, all, target) {
      var _check, _digtarget;
      if (clone == null) {
        clone = false;
      }
      if (all == null) {
        all = false;
      }
      if (target == null) {
        target = this.attributes;
      }
      _check = function(target, callback) {
        return helpers.forceCallback(changef, target, callback);
      };
      _digtarget = __bind(function(target, callback) {
        var bucket, cb, key, result;
        bucket = new helpers.parallelBucket();
        for (key in target) {
          cb = bucket.cb();
          result = function(err, data) {
            target[key] = data;
            return cb(err, data);
          };
          this.asyncDepthfirst(changef, result, clone, all, target[key]);
        }
        return bucket.done(function(err, data) {
          return callback(err, target);
        });
      }, this);
      if (target.constructor === Object || target.constructor === Array) {
        if (clone) {
          target = _.clone(target);
        }
        if (all) {
          return _check(target, function(err, target) {
            if (target.constructor === Object || target.constructor === Array) {
              return _digtarget(target, callback);
            } else {
              return callback(void 0, target);
            }
          });
        } else {
          return _digtarget(target, callback);
        }
      } else {
        return _check(target, callback);
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
    localChangePropagade: function(model, data) {
      var change;
      change = model.changedAttributes();
      delete change.id;
      return _.extend(this.changes, helpers.hashmap(change, function() {
        return true;
      }));
    },
    dirty: function(attribute) {
      return this.changes[attribute] = true;
    },
    localCallPropagade: function(name, args, callback) {
      return this.collection.fcall(name, args, {
        id: this.id
      }, callback);
    },
    remoteCallReceive: function(name, args, realm, callback) {
      return this[name].apply(this, args.concat(callback));
    },
    update: function(data, realm) {
      if (!realm) {
        return this.set(data);
      } else {
        return this.applyPermissions(data, realm, function(err, data) {
          if (!err) {
            return this.set(data);
          }
        });
      }
    },
    applyPermissions: function(data, realm, callback) {
      return callback();
    },
    applyPermission: function(attribute, value, realm, callback) {
      return true;
    },
    getPermission: function(attribute, realm, callback) {
      return async.series(_.map(this.permissions[attribute], function(permission) {
        return function(callback) {
          return permission.match(realm, function(err, data) {
            if (!err) {
              return callback(permission);
            } else {
              return callback();
            }
          });
        };
      }), function(err, data) {
        if (err) {
          return callback(void 0, err);
        } else {
          return callback('permission denied');
        }
      });
    },
    exportReferences: function(data, callback) {
      var _matchf;
      _matchf = function(value, callback) {
        var id;
        if (value instanceof RemoteModel) {
          if (id = value.get('id')) {
            callback(void 0, value.reference(id));
          } else {
            value.flush(function(err, id) {});
            if (err) {
              callback(err, id);
            } else {
              callback(void 0, value.reference(id));
            }
          }
        } else {
          return value;
        }
      };
      return this.asyncDepthfirst(_matchf, callback, true, false, data);
    },
    importReferences: function(data, callback) {
      var refcheck, _import, _matchf, _resolve_reference;
      _import = function(reference) {
        return true;
      };
      refcheck = v({
        _r: "String",
        _c: "String"
      });
      _resolve_reference = __bind(function(ref) {
        var targetcollection;
        if (!(targetcollection = this.collection.getcollection(ref._c))) {
          throw 'unknown collection "' + ref._c + '"';
        } else {
          return targetcollection.unresolved(ref._r);
        }
      }, this);
      _matchf = function(value, callback) {
        refcheck.feed(value, function(err, data) {
          if (err) {
            return callback(void 0, value);
          } else {
            return callback(void 0, _resolve_reference(value));
          }
        });
      };
      return this.asyncDepthfirst(_matchf, callback, false, true, data);
    },
    flush: function(callback) {
      return this.flushnow(callback);
    },
    flushnow: function(callback) {
      var changes;
      changes = helpers.hashfilter(this.changes, __bind(function(value, property) {
        return this.attributes[property];
      }, this));
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
