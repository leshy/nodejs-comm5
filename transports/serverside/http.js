var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator2-extras'); var Validator = v.v; var Select = v.Select
var core = require('../../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg

// sets realm for a message to be this.attributes.realm, 
// passes it to other potential local subscribers and broadcasts message to other nodes connected to this node
var HttpServer = exports.HttpServer = Backbone.Model.extend4000(
    MsgNode,
    v.ValidatedModel,
    {        
        validator: Validator({ express: true, realm: "String",  root: Validator().Default("/") }),
        initialize: function () {
            var self = this
            var app = this.get('express')
            var realm = this.get('realm')
            var root = this.get('root')

            function requestToMsg(req,res,next) {
                var from = req.socket.remoteAddress
                if (from == "127.0.0.1") { if (req.headers['x-forwarded-for']) { from = req.headers['x-forwarded-for'] }}

                var responseStream = self.msg({realm: realm, http: req.method, headers: req.headers, url: req.url, from: from})
                
                responseStream.set({name: 'httpresponse'})
                responseStream.read(function (msg) {
                    if (!msg) { res.end() } else {
                        res.write(JSON.stringify(msg.render()) + "\n")
                    }
                })
                responseStream.on('end', function () { res.end() })
            }

            app.get  (root + '*', function () { requestToMsg.apply(this,arguments) })
            app.post (root + '*', function () { requestToMsg.apply(this,arguments) })

            // warning, position of transmit next and reply.end seems to be relevant.. setTimeout is in order somewhere...
            this.subscribe(true,function (msg,reply,next,transmit) {
                self.log(['http','request'],msg.http + " " + msg.url)
                transmit()
                next()
                reply.end()
            },'log')
        }
    })

