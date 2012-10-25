_ = require('underscore')
Backbone = require('backbone4000');
decorators = require('decorators'); var decorate = decorators.decorate;
helpers = require('helpers')

Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
core = exports.MsgNode = require('../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg


WebsocketWrapper = exports.WebsocketWrapper = core.ConnectionMan.extend4000
    validator: v { realm: "String", socket: "Object" }
    
    tx: (msgstring) -> 
        @get('socket').emit 'msg', msgstring
    
    rx: (callback) -> 
        @get('socket').on 'msg', callback
