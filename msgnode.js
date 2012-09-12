// to quote a bible: "the water monster is right, cat man, they are among us."
var Backbone = require('backbone4000')
var _ = require('underscore')
var graph = require('graph')
var SubscriptionMan = require('subscriptionman').SubscriptionMan
var Msg = require('./msg').Msg
var v = require('validator'); var Validator = v.Validator; var Select = v.Select
var helpers = require('helpers')

var MakeObjReceiver = function(objclass) {
    return function() {
        var args = toArray(arguments);
        var f = args.shift();
        if ((!args.length) || (!args[0])) { f.apply(this,[]); return }
        if (args[0].constructor != objclass) { args[0] = new objclass(args[0]) }
        return f.apply(this,args)
    }
}

var MsgNode = exports.MsgNode = Backbone.Model.extend4000(
    graph.GraphNode,
    SubscriptionMan,
    {
        initialize: function () {
            this.subscribe({ meta: Validator({ replyto: true }) }, function (msg,reply,next,passthrough) {
                passthrough()
            })
        },

        connect: function () {
            var self = this
            _.map(helpers.toArray(arguments),function (node) {
                self.addconnection(node)
            })
        },

        // add pass function to a callback
        subscribe: function (pattern,callback,name) {
            var self = this;

            var wrap = function (msg,next) {
                var pass = function () { self.send(msg) }
                var replyStream = msg.makereply()
                callback(msg,replyStream,next,pass)
                return replyStream
            }
            
            SubscriptionMan.prototype.subscribe.call(this,pattern,wrap,name)
        },

        msg: function (msg,callback) {
            //if msg.constructor BLA BLA
            return SubscriptionMan.prototype.msg.call(this,msg,callback)
        },
        
        send: function (msg,callback) {
            async.parallel(
                this.getNodes(msg, function (node) {
                    return function (callback) {
                        var reply = node.msg(msg)
                        reply.read(callback)
                    }
                }), callback )
        }
    })

