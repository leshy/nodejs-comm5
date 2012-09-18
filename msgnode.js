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
            var self = this
            this.log({ meta: Validator({ replyto: true, path: Validator().Not("Array") }) },
                     [ 'weirdness', 'msg', 'msgnode', 'core' ], 
                     this.get('name') + " got replyto message but didn't get a path",
                     { node: this.get('name') })
            
            this.subscribe({ meta: Validator({ replyto: true, path: "Array" }) }, function (msg,reply,next,passthrough) {
                var nextnode = msg.meta.path.shift()

                // magic!

            })

        },
        
        // used to request logging for specific message patterns
        log: function (pattern,tags,msg,extras,logger) {
            if (!pattern || !tags || !msg) { throw 'invalid arguments for log' }
            if (!extras) { extras = {} }
            
            if (!logger && !(logger = this.get('logger'))) { console.warn ("log requested yet I don't have a logger"); return }
            
            this.subscribe(pattern, function () {
                logger.msg(_.extend(extras,{ tags: tags, msg: msg }))
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
            msg.meta.breadcrumbs.push(this)
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

