(function() {
  var Backbone, Msg, MsgNode, Select, Validator, WebsocketWrapper, core, helpers, v, _;
  _ = require('underscore');
  Backbone = require('backbone4000');
  helpers = require('helpers');
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  core = require('../core/');
  MsgNode = core.MsgNode;
  Msg = core.Msg;
  WebsocketWrapper = exports.WebsocketWrapper = core.ConnectionMan.extend4000({
    validator: v({
      realm: "string",
      socket: "instance"
    }),
    tx: function(msgstring) {
      return this.get('socket').emit('msg', msgstring);
    },
    rx: function(callback) {
      return this.get('socket').on('msg', callback);
    }
  });
}).call(this);