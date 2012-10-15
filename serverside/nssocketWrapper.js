var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator'); var Validator = v.Validator; var Select = v.Select
var core = require('../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg

var nssocket = require('nssocket')

var nssocketWrapper = exports.nssocketWrapper = core.ConnectionMan.extend4000({    
    validator: Validator({ 
        realm: "String",
        socket: "Object"
    }),
    
    tx: function (msgstring) {
        this.get('socket').send(['msg'],msgstring)
    },
    
    rx: function (callback) {
        this.get('socket').data(['msg'], function (msgstring) {
            callback(msgstring)
        })
    }
})



var nssocketServer = exports.nssocketServer = core.MsgNode.extend4000({
    validator: Validator({ 
        realm: "String",
        port: "Number"
    }),
    
    newClient: function (callback) {
        var self = this
        this.server = nssocket.createServer(function (socket) {
            callback(new nssocketWrapper({ realm: self.get('realm'), socket: socket}))
        })
    },

    listen: function (port) {
        this.server.listen(port || this.get('port'))
    },

    end: function () {
        this.del()
    }
    
})

var nssocketClient = exports.nssocketClient = core.MsgNode.extend4000({
    validator: Validator({ 
        realm: "String"
    }),

    initialize: function () {
        this.subscribe(true, function (msg,reply,next,transmit) {
            reply.end()
            next()
            transmit()
        })
    },

    connect: function (host,port) {
        var socket  = new nssocket.NsSocket()
        socket.connect(host,port)
        var client = new nssocketWrapper({ realm: this.get('realm'), socket: socket})
        this.addconnection(client)
    },

    end: function () {
        this.del()
    }
})

