// to quote a bible: "the water monster is right, cat man, they are among us."
var Backbone = require('backbone4000')
var _ = require('underscore')
var graph = require('graph')
var SubscriptionMan = require('./StreamingSubscriptionman').SubscriptionMan
var Msg = require('./msg').Msg
var v = require('validator'); var Validator = v.Validator; var Select = v.Select
var helpers = require('helpers')
var decorators = require('decorators')
var decorate = decorators.decorate

var MakeObjReceiver = function(objclass) {
    return function() {
        var args = helpers.toArray(arguments);
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

        defaults: { name: "unnamed node" },

        initialize: function () {
            var self = this
            /*
            this.log({ meta: Validator({ replyto: true, path: Validator().Not("Array") }) },
                     [ 'weirdness', 'msg', 'msgnode', 'core' ], 
                     this.get('name') + " got replyto message but didn't get a path",
                     { node: this.get('name') })
            */

        },
        
        // used to request logging for specific message patterns
        log: function (pattern,tags,msg,extras,logger) {
            if (!pattern || !tags || !msg) { throw 'invalid arguments for log' }
            if (!extras) { extras = {} }
            
            var self = this
            
            this.subscribe(pattern, function () {
                if (!logger && !(logger = self.get('logger'))) { console.log (msg, tags); return }
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
            /*
            var wrap = function (msg,next) {
                var pass = function () { self.send(msg) }
                var replyStream = msg.makereply()
                callback(msg,replyStream,next,pass)
                return replyStream
            }
            */
            SubscriptionMan.prototype.subscribe.call(this,pattern,callback,name)
        },

        msg: decorate(MakeObjReceiver(Msg), function (msg) {
            msg.meta.breadcrumbs.push(this)
            return SubscriptionMan.prototype.msg.call(this,msg)
        }),
        
        send: function (msg,callback) {

            // this message is a reply to something, we know exactly where to send it, don't broadcast it.
            if (msg.meta.replyto) { 
                msg.meta.path.shift().msg(msg,callback)
                return
            } else {
                async.parallel(
                    this.getNodes(msg, function (node) {
                        return function (callback) {
                            var reply = node.msg(msg)
                            reply.read(callback)
                        }
                    }), callback )
            }
        }
    })

