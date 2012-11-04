var _ = require('underscore')
var Backbone = require('backbone4000')
var WebsocketWrapper = require('../websocket').WebsocketWrapper
var io = require('socket.io')
var validator = require('validator2-extras'); var v = validator.v; var Select = validator.Select
var core = exports.MsgNode = require('../../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg
var helpers = require('helpers')

var WebsocketServer = exports.WebsocketServer = Backbone.Model.extend4000(
    MsgNode,
    validator.ValidatedModel,
    { 
        validator: v({ 
            realm: "string",
            express: "instance"
        }),
        
        initialize: function () { this.pass() },

        listen: function (ClientCallback) {
            var self = this
            var server = io.listen(this.get('express'))
//            server.set('log level',1)
            server.on('connection', function (socket) {
                var client = new WebsocketWrapper({socket: socket, realm: self.get('realm') })
                self.addconnection(client)
                helpers.cbc(ClientCallback,client)
            })
        }
    })


