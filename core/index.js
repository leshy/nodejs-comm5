var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator2-extras'); 
var Validator = v.v;

var Msg = exports.Msg = require('./msg').Msg
var MsgNode = exports.MsgNode = require('./msgnode').MsgNode

exports.callbackMsg = function (reply) { return function (err,data) { reply.write({ err: err, data: data  })} }
exports.callbackMsgEnd = function (reply) { return function (err,data) { reply.end({ err: err, data: data  })} }
exports.msgCallback = function (reply,callback) { if (!callback) { return }; reply.readOne(function (msg) { callback(msg.err,msg.data) }) }

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
            
            var received = {}
            var streams = {}
            var self = this
            

            this.subscribe(true,function (msg,reply,next,transmit) {
                if (received[msg.meta.id]) {
                    reply.end(); next(); transmit(); return
                }
                var txmsg = msg.render()
                txmsg.meta = { id: msg.meta.id }
                streams[msg.meta.id] = reply // when I receive replies write them here
                self.tx(txmsg) // send the message
            })
            
            this.rx(function (msg) { 
                msg = new Msg(msg)
                if (msg.meta.replyto) {
                    streams[msg.meta.replyto].write(msg)
                } else if (msg.meta.end) {
                    streams[msg.meta.end].end()
                } else {

                    received[msg.meta.id] = true
                    
                    var stream = self.msg(msg)
                    
                    stream.read(function (replymsg) {
                        if (!replymsg) { delete received[msg.meta.id]; 
                                         self.tx( { meta: { end: msg.meta.id }} ); 
                                         return 
                                       }
                        replymsg.meta.replyto = msg.meta.id
                        self.tx(replymsg)
                    })
                }
            })

        }
    })

