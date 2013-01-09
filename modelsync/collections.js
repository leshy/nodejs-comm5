(function() {
  var Backbone, CollectionExposer, ModelMixin, Msg, MsgNode, RemoteCollection, RemoteModel, Select, SubscriptionMan, SubscriptionMixin, Validator, async, core, decorate, decorators, helpers, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  Backbone = require('backbone4000');
  _ = require('underscore');
  decorators = require('decorators');
  decorate = decorators.decorate;
  async = require('async');
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  core = require('../core/');
  MsgNode = core.MsgNode;
  Msg = core.Msg;
  RemoteModel = require('./remotemodel').RemoteModel;
  SubscriptionMan = require('subscriptionman').SubscriptionMan;
  CollectionExposer = exports.CollectionExposer = MsgNode.extend4000({
    defaults: {
      name: void 0
    },
    initialize: function() {
      var name;
      name = this.get('name');
      this.subscribe({
        collection: name,
        create: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.create(msg.create, core.callbackMsgEnd(reply));
      }, this));
      this.subscribe({
        collection: name,
        remove: "Object",
        raw: true
      }, __bind(function(msg, reply, next, transmit) {
        return this.remove(msg.remove, core.callbackMsgEnd(reply));
      }, this));
      this.subscribe({
        collection: name,
        update: "Object",
        data: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.update(msg.update, msg.data, core.callbackMsgEnd(reply));
      }, this));
      this.subscribe({
        collection: name,
        remove: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.findModels(msg.find).each(__bind(function(entry) {
          if (entry != null) {
            return entry.remove();
          } else {
            return reply.end();
          }
        }, this));
      }, this));
      this.subscribe({
        collection: name,
        update: "Object",
        data: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.findModels(msg.find).each(__bind(function(entry) {
          if (entry != null) {
            entry.update(data);
            return entry.flush();
          } else {
            return reply.end();
          }
        }, this));
      }, this));
      this.subscribe({
        collection: name,
        find: "Object",
        limits: v().Default({}).Object()
      }, __bind(function(msg, reply, next, transmit) {
        return this.find(msg.find, msg.limits, __bind(function(entry) {
          if (entry != null) {
            return reply.write({
              data: entry,
              err: void 0
            });
          } else {
            return reply.end();
          }
        }, this));
      }, this));
      this.subscribe({
        collection: name,
        findOne: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.findOne(msg.findOne, __bind(function(entry) {
          if (entry != null) {
            return reply.write({
              data: entry,
              err: void 0
            });
          } else {
            return reply.end();
          }
        }, this));
      }, this));
      this.subscribe({
        collection: name,
        subscribe: "Object",
        tags: "Array"
      }, __bind(function(msg, reply, next, transmit) {
        return this.subscribe(msg.subscribe, __bind(function(event) {
          return reply.write(event);
        }, this));
      }, this));
      return this.subscribe({
        collection: name,
        call: "String",
        args: "Array",
        data: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.fcall(msg.call, msg.args, msg.data, function(err, data) {
          if (err || data) {
            return reply.write({
              err: err,
              data: data
            });
          } else {
            return reply.end();
          }
        });
      }, this));
    }
  });
  SubscriptionMixin = exports.SubscriptionMixin = Backbone.Model.extend4000({
    superValidator: v({
      create: 'function',
      update: 'function',
      remove: 'function'
    }),
    create: function(entry, callback) {
      return this._super('create', entry, __bind(function(err, id) {
        this.msg({
          collection: this.get('name'),
          action: 'create',
          entry: _.extend({
            id: id
          }, entry)
        });
        return callback(err, id);
      }, this));
    },
    update: function(pattern, update, callback) {
      this._super('update', pattern, update, callback);
      return this.msg({
        collection: this.get('name'),
        action: 'update',
        pattern: pattern,
        update: update
      });
    },
    remove: function(pattern, callback) {
      this._super('remove', pattern, callback);
      return this.msg({
        collection: this.get('name'),
        action: 'remove',
        pattern: pattern
      });
    },
    subscribechanges: function(pattern, callback, name) {
      return this.subscribe({
        pattern: pattern
      }, function(msg, reply, next, transmit) {
        reply.end();
        next();
        transmit();
        return callback(msg);
      });
    },
    unsubscribechanges: function() {
      return true;
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
      definition.defaults._t = name;
      return this.models[name] = RemoteModel.extend4000.apply(RemoteModel, superclasses.concat(definition));
    },
    resolveModel: function(entry) {
      var keys, tmp;
      keys = _.keys(this.models);
      if (keys.length === 0) {
        throw "I don't have any models defined";
      }
      if (keys.length === 1 || !(entry._t != null)) {
        return this.models[_.first(keys)];
      }
      if (entry._t && (tmp = this.models[entry._t])) {
        return tmp;
      }
      throw "unable to resolve " + JSON.stringify(entry) + " " + _.keys(this.models).join(", ");
    },
    findModels: function(pattern, limits, callback) {
      return this.find(pattern, limits, __bind(function(entry) {
        if (!(entry != null)) {
          return callback();
        } else {
          return callback(new (this.resolveModel(entry))(entry));
        }
      }, this));
    },
    findModel: function(pattern, callback) {
      return this.findOne(pattern, __bind(function(entry) {
        if (!(entry != null)) {
          return callback();
        } else {
          return callback(new (this.resolveModel(entry))(entry));
        }
      }, this));
    },
    fcall: function(name, args, pattern, callback) {
      return this.findModels(pattern, {}, function(model) {
        if (model != null) {
          return model.remoteCallReceive(name, args, function(err, data) {
            return callback(err, data);
          });
        } else {
          return callback();
        }
      });
    }
  });
  RemoteCollection = exports.RemoteCollection = Backbone.Model.extend4000(ModelMixin, SubscriptionMixin, Validator.ValidatedModel, MsgNode, {
    validator: v({
      name: "String"
    }),
    create: function(entry, callback) {
      return core.msgCallback(this.send({
        collection: this.get('name'),
        create: entry
      }), callback);
    },
    remove: function(pattern, callback) {
      return core.msgCallback(this.send({
        collection: this.get('name'),
        remove: pattern,
        raw: true
      }), callback);
    },
    update: function(pattern, data, callback) {
      return core.msgCallback(this.send({
        collection: this.get('name'),
        update: pattern,
        data: data,
        raw: true
      }), callback);
    },
    find: function(pattern, limits, callback) {
      var reply;
      reply = this.send({
        collection: this.get('name'),
        find: pattern,
        limits: limits
      });
      return reply.read(function(msg) {
        if (msg) {
          return callback(msg.data);
        } else {
          return callback();
        }
      });
    },
    findOne: function(pattern, callback) {
      var reply;
      reply = this.send({
        collection: this.get('name'),
        findOne: pattern
      });
      return reply.read(function(msg) {
        if (msg) {
          return callback(msg.data);
        } else {
          return callback();
        }
      });
    },
    fcall: function(name, args, pattern, callback) {
      var reply;
      reply = this.send({
        collection: this.get('name'),
        call: name,
        args: args,
        data: pattern
      });
      return reply.read(function(msg) {
        if (msg) {
          return callback(msg.err, msg.data);
        }
      });
    }
  });
}).call(this);
