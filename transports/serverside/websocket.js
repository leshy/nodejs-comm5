var _ = require('underscore')
var Backbone = require('backbone4000')
var WebsocketWrapper = require('../websocket').WebsocketWrapper
var io = require('socket.io')
var validator = require('validator2-extras'); var v = validator.v; var Select = validator.Select
var core = exports.MsgNode = require('../../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg

var WebsocketServer = exports.WebsocketServer = Backbone.Model.extend4000(
    MsgNode,
    validator.ValidatedModel,
    { 
        validator: v({ 
            realm: "String",
            express: "Object"
        }),
        
        listen: function (ClientCallback) {
            var self = this
            var server = io.listen(this.get('express'))

            server.on('connection', function (socket) {
                ClientCallback(new WebsocketWrapper({socket: socket, realm: self.get('realm') }))
            })
        }
    })
