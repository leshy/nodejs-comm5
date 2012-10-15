var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator'); var Validator = v.Validator; var Select = v.Select
var core = exports.MsgNode = require('../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg

var nssocketWrapper = exports.nssocketWrapper = core.ConnectionMan.extend4000({    
    validator: Validator({ 
        realm: "String",
        socket: "Object"
    }),
    
    initialize: function () {
        
    },
    
    tx: function (msgstring) {
        this.get('socket').send(['msg'],msgstring)
    },
    
    rx: function (callback) {
        this.get('socket').data(['msg'], function (msgstring) {
            callback(msgstring)
        })
    }
})


