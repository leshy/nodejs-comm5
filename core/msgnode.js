// to quote a bible: "the water monster is right, cat man, they are among us."
var Backbone = require('backbone4000')
var _ = require('underscore')
var graph = require('graph')
var SubscriptionMan = require('subscriptionman').SubscriptionMan
var Msg = require('./msg').Msg
var Stream = require('./msgstream').Stream
var v = require('validator'); var Validator = v.Validator; var Select = v.Select
var helpers = require('helpers')
var decorators = require('decorators')
var decorate = decorators.decorate
var async = require('async')

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
            if (!logger && !(logger = this.get('logger'))) { console.log (tags,msg); return }
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

        msg: decorate(MakeObjReceiver(Msg), function (msg) {
            
            

            if (this.messages[msg.meta.id]) { return } else { this.messages[msg.meta.id] = true }

            var self = this
            var mainStream = new Stream()
            var _transmit = false

            msg.meta.breadcrumbs.push(this)
            
            function transmit () { _transmit = true }
            
            setTimeout(function () {
                function wrap (f) {
                    function wrapped (msg,next) {
                        var replyStream = msg.makeReplyStream()

                        mainStream.addchild(replyStream) // it would be cool if replyStream was spawned in some kind of inactive state.
                                                         // so that I don't need to explicitly .end() it if we don't want to send anything

                        f(msg,replyStream,next,transmit)
                    }
                    return wrapped
                }
                
                SubscriptionMan.prototype.msg.call(self,msg,wrap)            
                
            })

            mainStream.on('children_end',function () {
                if (_transmit) { mainStream.addchild(self.send(msg)) } // this won't transmit a modified msg.. maybe. fixor?
                mainStream.end()
            })

            mainStream.on('end',function () { console.log("mainstream end");delete this.messages[msg.meta.id] }.bind(this))
            return mainStream
        }),

        // ALLRIGHT!!!!!!!!!!!
        send: function (msg) {

            // this message is a reply to something, we know exactly where to send it, don't broadcast it.
            if (msg.meta.replyto) { 
                var replyStream = msg.meta.path.shift().msg(msg,callback)
                return
            } else {
                var replyStream = new Stream()
                var lastnode = _.last(msg.meta.breadcrumbs)
                async.parallel(
                    this.connections.map(function (node) {
                        return function (callback) {
                            var Stream = node.msg(msg)
                            if (Stream) { replyStream.addchild(Stream) }
                            callback()
                        }
                    }))
            }
            return replyStream
        }
    })


