(function() {
  var Backbone, Msg, MsgNode, Select, Validator, WebsocketClient, WebsocketWrapper, core, helpers, io, v, _;
  _ = require('underscore');
  Backbone = require('backbone4000');
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  core = require('../../core/');
  MsgNode = core.MsgNode;
  Msg = core.Msg;
  io = require('socket.io-browserify');
  WebsocketWrapper = require('../websocket').WebsocketWrapper;
  WebsocketClient = exports.WebsocketClient = Backbone.Model.extend4000(MsgNode, Validator.ValidatedModel, {
    validator: v({
      realm: 'string'
    }),
    initialize: function() {
      return this.pass();
    },
    connect: function(host, callback) {
      var client, socket;
      socket = io.connect(host);
      client = new WebsocketWrapper({
        realm: this.get('realm'),
        socket: socket
      });
      socket.on('connect', callback);
      return this.addconnection(client);
    },
    end: function() {
      return this.del();
    }
  });
}).call(this);
