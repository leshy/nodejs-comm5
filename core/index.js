var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator'); var Validator = v.Validator; var Select = v.Select

var Msg = exports.Msg = require('./msg').Msg
var MsgNode = exports.MsgNode = require('./msgnode').MsgNode



// sets realm for a message to be this.attributes.realm, 
// passes it to other potential local subscribers and broadcasts message to other nodes connected to this node
var BorderMan = exports.BorderMan = Backbone.Model.extend4000(
    MsgNode,
    v.ValidatedModel,
    {        
        validator: Validator({ realm: "String" }),

        initialize: function () {
            var self = this
            self.subscribe({ realm: Validator().Set(self.get('realm')) },function (msg,reply,next,transmit) {
                transmit(); reply.end()
            })
        }
    })




var ServerMan = exports.ServerMan = Backbone.Model.extend4000(
    MsgNode,
    v.ValidatedModel,
    {
        validator: Validator({ protocol: Validator(true),
                               options: Validator().Default({}).Object() }),
                               
        
        initialize: function () {
            this.server = this.get('protocol')
            this.server.start(this.get('options'))
            
            this.server.connection(function (connection) {
                
            })
        }
    })


var ConnectionMan = exports.ConnectionMan = Backbone.Model.extend4000(
    MsgNode,
    v.ValidatedModel,
    {
        initialize: function () {
            
            var streams = {}
            var self = this

            this.subscribe(true,function (msg,reply,next,transmit) {
                var txmsg = msg.render()
                txmsg.meta = { id: msg.meta.id }
                self.tx(txmsg)
                streams[id] = reply
            })
            
            this.connection.rx(function (msg) { 
                if (msg.meta.replyto) {
                    streams[msg.meta.replyto].write(msg)
                } else {
                    var stream = this.msg(msg)
                    stream.read(function (msg) {
                        if (!msg) { return } 
                        connection.tx(msg)
                    })
                }
                
            })
        },

        msg: function () {
            

        }
        
        
        
        
        
    })
