// to quote a bible: "the water monster is right, cat man, they are among us."
var Backbone = require('backbone4000')
var _ = require('underscore')
var graph = require('graph')
var SubscriptionMan = require('subscriptionman').SubscriptionMan
var Stream = require('./msgstream').Stream
var Msg = require('./msg').Msg
var v = require('validator'); var Validator = v.Validator; var Select = v.Select
var helpers = require('helpers')
var decorators = require('decorators')
var decorate = decorators.decorate
var async = require('async')

var MsgNode = exports.MsgNode = Backbone.Model.extend4000(
    graph.GraphNode,
    SubscriptionMan,
    {

        defaults: { name: "unnamed node", stream: Stream },

        initialize: function () {
            var self = this
            this.messages = {}
            this.subscribe({ meta: Validator({ replyto: true, path: Validator().Not("Array") }) },
                           function (msg,reply,next,transmit) {
                               self.log([ 'weirdness', 'msg', 'msgnode', 'core' ], this.get('name') + " got replyto message but didn't get a path")
                               reply.end()
                           })

            // replies are allowed to pass through
            this.subscribe({ meta: Validator({ replyto: true, path: "Array"})}, function (msg,reply,next,transmit) { transmit(); next(); })

        },
        
        log: function (tags,msg,extras,logger) {
            if (!extras) { extras = {} }
            if (!logger && !(logger = this.get('logger'))) { console.log (String(new Date().getTime()).yellow + " " +  this.get('name').green, tags, msg); return }
            logger.msg(_.extend(extras,{ tags: tags, msg: msg }))
        },

        connect: function () {
            var self = this
            _.map(helpers.toArray(arguments),function (node) {
                self.addconnection(node)
            })
        },

        passthrough: function () { // allow all messages to pass through this node
            this.subscribe(true,function (msg,reply,next,transmit) { reply.end(); transmit(); })
        },

        msg: decorate(decorators.MakeObjReceiver(Msg), function (msg) {
            if (this.messages[msg.meta.id]) { return } else { this.messages[msg.meta.id] = true }
            //this.log(['msg',9],'received message ' + JSON.stringify(msg.render()))
            var self = this
            
            var mainStream = new (this.get('stream'))({name: "mainStream-" + this.get('name')})
            var _transmit = false

            msg.meta.breadcrumbs.push(this)
            
            function transmit () { _transmit = true }
            
            var subscribersStream = new Stream({name: "subscribers-" + this.get('name')})
            mainStream.addchild(subscribersStream)
            
            process.nextTick(function () {
                function wrap (f,name) {
                    function wrapped (msg,next) {
                        var replyStream = msg.makeReplyStream()
                        replyStream.set({name: self.get('name') + "-" + name})
                        subscribersStream.addchild(replyStream) // it would be cool if replyStream was spawned in some kind of inactive state.
                                                               //  so that I don't need to explicitly .end() it if we don't want to send anything
                        f(msg,replyStream,next,transmit)
                    }
                    return wrapped
                }
                
                SubscriptionMan.prototype.msg.call(self,msg,wrap)
                subscribersStream.end()
            })
            
            subscribersStream.on('end',function () {
                if (_transmit) { 
                    mainStream.addchild(self.send(msg))
                }
                mainStream.end()
            })

            mainStream.on('end',function () { 
                //self.log(['stream',9],'mainstream end')
                delete self.messages[msg.meta.id]
            })

            return mainStream
        }),

        send: function (msg) {
            var replyStream = new Stream({name: "childrenStream-" + this.get('name')})
            async.parallel(
                this.connections.map(function (node) {
                    return function (callback) {
                        var Stream = node.msg(msg)
                        if (Stream) { replyStream.addchild(Stream) }
                        callback()
                    }
                }))
            replyStream.end()
            return replyStream
        }
    })


