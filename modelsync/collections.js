(function() {
  var Backbone, CollectionAbsLayer, CollectionExposer, Msg, MsgNode, RemoteCollection, Select, SubscriptionMan, Validator, async, core, decorate, decorators, helpers, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Backbone = require('backbone');
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
  CollectionAbsLayer = exports.CollectionAbsLayer = Backbone.Model.extend4000({
    create: function(data) {
      return true;
    },
    remove: function(pattern) {
      return true;
    },
    update: function(pattern, data) {
      return true;
    },
    filter: function(pattern, limits) {
      return true;
    }
  });
  RemoteCollection = Backbone.Model.extend4000(CollectionAbsLayer, Validator.ValidatedModel, MsgNode, {
    validator: v({
      name: "String"
    }),
    create: function(data) {
      return this.send({
        collection: this.get('name'),
        create: data
      });
    },
    remove: function(pattern) {
      return this.send({
        collection: this.get('name'),
        remove: pattern
      });
    },
    update: function(pattern, data) {
      return this.send({
        collection: this.get('name'),
        remove: pattern
      });
    },
    filter: function(pattern, limits) {
      return this.send({
        collection: this.get('name'),
        filter: pattern
      });
    }
  });
  CollectionExposer = exports.CollectionExposer = MsgNode.extend4000({
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
        remove: "Object"
      }, __bind(function(msg, reply, next, transmit) {
        return this.filter(msg.filter).each(__bind(function(entry) {
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
        return this.filter(msg.filter).each(__bind(function(entry) {
          if (entry != null) {
            return entry.update(data);
          } else {
            return reply.end;
          }
        }, this));
      }, this));
      this.subscribe({
        collection: name,
        filter: "Object",
        limits: v().Default({}).Object()
      }, __bind(function(msg, reply, next, transmit) {
        return this.filter(msg.filter).each(__bind(function(entry) {
          if (entry != null) {
            return reply.write(entry);
          } else {
            return reply.end;
          }
        }, this));
      }, this));
      return this.subscribe({
        collection: name,
        subscribe: "Object"
      }, __bind(function(msg, reply, next, transmit) {}, this));
    }
  });
}).call(this);
