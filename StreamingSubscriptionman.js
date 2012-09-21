var SubscriptionMan = require('subscriptionman').SubscriptionMan
var Stream = require('./msgstream').Stream
var _ = require('underscore')
var v = require('validator'); var Validator = v.Validator; var Select = v.Select

exports.SubscriptionMan = SubscriptionMan.extend4000({
    msg: function (msg) {
        var JoinedStream = new Stream()

        var args = _.flatten(_.map(_.values(this.patterns),
                                   function (matcher) { 
                                       return [ matcher.validator, 
                                                
                                                function (msg,next) {
                                                    var Stream = matcher.callback(msg,next)
                                                    JoinedStream.addchild(Stream)
                                                }             
                                              ]
                                   }))
        
        

        JoinedStream.end()
            
        if (!args.length) { return JoinedStream }
        args.unshift(msg)
        Select.apply(this, args)

        return JoinedStream
    },


    // add pass function to a callback
    subscribe: function (pattern,callback,name) {
        var self = this;
        var wrap = function (msg,next) {
            var replyStream = msg.makeReplyStream()
            setTimeout(function () {callback(msg,replyStream,next)})
            return replyStream
        }
        
        SubscriptionMan.prototype.subscribe.call(this,pattern,wrap,name)
    }
})


