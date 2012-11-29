(function() {
  var Backbone, Msg, MsgNode, Rest, Select, Validator, core, decorate, decorators, helpers, v, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require('underscore');
  Backbone = require('backbone4000');
  decorators = require('decorators');
  decorate = decorators.decorate;
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  core = require('../../core/');
  MsgNode = core.MsgNode;
  Msg = core.Msg;
  Rest = exports.Rest = Backbone.Model.extend4000(MsgNode, Validator.ValidatedModel, {
    validator: v({
      root: v().Default("/")
    }),
    initialize: function() {
      var root;
      root = this.get('root');
      this.subscribe({
        http: 'GET',
        url: v().regex(new RegExp(root + "(.*)\/(.*)\/(.*)", "g"))
      }, __bind(function(msg, reply, next, transmit) {
        var attribute, collection, find, res, searchstring;
        collection = msg.url[1];
        attribute = msg.url[2];
        searchstring = msg.url[3];
        find = {};
        find[attribute] = {
          '$regex': '.*' + searchstring + '.*'
        };
        console.log(find);
        res = this.send({
          collection: collection,
          find: find,
          limits: {}
        });
        return res.read(function(msg) {
          if (msg) {
            return reply.write(msg.data);
          } else {
            return reply.end();
          }
        });
      }, this));
      this.subscribe({
        http: 'GET',
        url: v().regex(new RegExp(root + "(.*)\/(.*)", "g"))
      }, __bind(function(msg, reply, next, transmit) {
        var collection, res, searchstring;
        collection = msg.url[1];
        searchstring = msg.url[2];
        res = this.send({
          collection: collection,
          find: {
            title: {
              '$regex': '.*' + searchstring + '.*'
            }
          },
          limits: {}
        });
        return res.read(function(msg) {
          if (msg) {
            return reply.write(msg.data);
          } else {
            return reply.end();
          }
        });
      }, this));
      this.subscribe({
        http: 'GET',
        url: v().regex(new RegExp(root + "(.*)", "g"))
      }, __bind(function(msg, reply, next, transmit) {
        var collection, res;
        collection = msg.url[1];
        res = this.send({
          collection: collection,
          find: {},
          limits: {}
        });
        return res.read(function(msg) {
          if (msg) {
            return reply.write(msg.data);
          } else {
            return reply.end();
          }
        });
      }, this));
      return this.subscribe({
        http: 'POST',
        url: v().regex(new RegExp(root + "(.*)\/(.*)", "g"))
      }, __bind(function(msg, reply, next, transmit) {
        var collection, id;
        collection = msg.url[1];
        id = msg.url[2];
        reply.write({
          collection: name,
          book: id,
          update: 'unknwon'
        });
        return reply.end();
      }, this));
    }
  });
}).call(this);
