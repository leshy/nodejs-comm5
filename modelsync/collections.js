(function() {
  var Backbone, CollectionExposer, Msg, MsgNode, RemoteCollection, Select, SubscriptionMan, Validator, async, core, decorate, decorators, helpers, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
  SubscriptionMan = require('subscriptionman').SubscriptionMan;
  /*
  CollectionAbsLayer = exports.CollectionAbsLayer = Backbone.Model.extend4000
      create: (entry,callback) -> console.log 'not implemented'
      remove: (pattern,callback) -> console.log 'not implemented'
      update: (pattern,data,callback) -> console.log 'not implemented'
      find: (pattern,limits,callback) -> console.log 'not implemented'
  */
  RemoteCollection = exports.RemoteCollection = Backbone.Model.extend4000(Validator.ValidatedModel, MsgNode, {
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
    }
  });
  CollectionExposer = exports.CollectionExposer = MsgNode.extend4000({
    defaults: {
      name: void 0
    },
    initialize: function() {
      var name;
      name = this.get('name');
      this.subscriptions = new SubscriptionMan();
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
        return this.find(msg.find).each(__bind(function(entry) {
          if (entry != null) {
            return entry.remove();
          } else {
            return reply.end;
          }
        }, this));
      }, this));
      this.subscribe({
        collection: name,
        update: "Object",
        data: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.find(msg.find).each(__bind(function(entry) {
          if (entry != null) {
            return entry.update(data);
          } else {
            return reply.end;
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
      return this.subscribe({
        collection: name,
        subscribe: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return true;
      }, this));
    }
  });
}).call(this);
