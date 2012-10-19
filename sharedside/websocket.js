var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator2-extras'); var Validator = v.v; var Select = v.Select
var core = exports.MsgNode = require('../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg


var WebsocketWrapper = exports.WebsocketWrapper = core.ConnectionMan.extend4000({ 
    validator: Validator({ 
        realm: "String",
        socket: "Object"
    }),
    
    tx: function (msgstring) {
        this.get('socket').emit('msg',msgstring)
    },
    
    rx: function (callback) {
        this.get('socket').on('msg',callback)
    }
})
