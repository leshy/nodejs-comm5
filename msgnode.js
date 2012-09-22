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
            /*
            this.log({ meta: Validator({ replyto: true, path: Validator().Not("Array") }) },
                     [ 'weirdness', 'msg', 'msgnode', 'core' ], 
                     this.get('name') + " got replyto message but didn't get a path",
                     { node: this.get('name') })
            */

            this.subscribe({ meta: Validator({ replyto: true, path: "Array"})}, function (msg,reply,next,transmit) { transmit(); next(); })

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

        msg: decorate(MakeObjReceiver(Msg), function (msg) {
            var self = this
            var mainStream = new Stream()
            var _transmit = false

            msg.meta.breadcrumbs.push(this)
            
            function transmit () { _transmit = true }
            
            function wrap (f) {
                function wrapped (msg,reply,next) {
                    var replyStream = msg.makeReplyStream()
                    mainStream.addchild(replyStream)
                    setTimeout(function () { f(msg,replyStream,next,transmit) })
                }

                return wrapped

            }

            mainStream.on('children_end',function () {
                if (_transmit) { mainStream.addchild(self.send(msg)) } // this won't transmit a modified msg.. maybe. fixor?
                mainStream.end()
            })
            
            SubscriptionMan.prototype.msg.call(this,msg,wrap)
            
            return mainStream
        }),

        //ALLRIGHT!!!!!!!!!!!
        send: function (msg) {

            // this message is a reply to something, we know exactly where to send it, don't broadcast it.
            if (msg.meta.replyto) { 
                var replyStream = msg.meta.path.shift().msg(msg,callback)
                return
            } else {
                var replyStream = new Stream()
                async.parallel(
                    this.connections.map(function (node) {
                        return function (callback) {
                            replyStream.addchild(node.msg(msg))
                            callback()
                        }
                    }))
            }

            return replyStream
        }
    })

