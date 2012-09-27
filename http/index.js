var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator'); var Validator = v.Validator; var Select = v.Select

var Msg = exports.Msg = require('../core/msg').Msg
var MsgNode = exports.MsgNode = require('../core/msgnode').MsgNode



// sets realm for a message to be this.attributes.realm, 
// passes it to other potential local subscribers and broadcasts message to other nodes connected to this node
var HttpServer = exports.HttpServer = Backbone.Model.extend4000(
    MsgNode,
    v.ValidatedModel,
    {        
        validator: Validator({ express: "Object", root: Validator().Default("/") }),

        initialize: function () {
            var self = this
            
            var app = this.get('express')
            
            function requestToMsg(req,res,next) {
                var from = req.socket.remoteAddress
                if (from == "127.0.0.1") { if (req.headers['x-forwarded-for']) { from = req.headers['x-forwarded-for'] }}

                var responseStream = self.msg({http: req.method, headers: req.headers, url: req.url, from: from})
                
                console.log("BINDING ON RESPONSESTREAM")
                
                responseStream.read(function (msg) {
                    if (!msg) { res.end() } else {
                        res.write(JSON.stringify({ hello: msg.hello}))
                    }
                })
                

                responseStream.on('end', function () { console.log("RESPONSESTREAM END"); res.end() })

                console.log("DONE")

            }

            app.get  ('*', function () { requestToMsg.apply(this,arguments) })
            app.post ('*', function () { requestToMsg.apply(this,arguments) })

            // warning, position of transmit next and reply.end seems to be relevant.. setTimeout is in order somewhere...
            this.subscribe(true,function (msg,reply,next,transmit) {
                self.log(['http','request'],msg.http + " " + msg.url)
                transmit()
                next()
                reply.end()
            },'log')
        }
        
    })

