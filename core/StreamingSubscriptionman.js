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
                                                    JoinedStream.addchild(Stream)
                                                    // settimeout is important.. it gives you time to bind on the reply stream
                                                    setTimeout(function () { matcher.callback(msg,Stream,next) }) 
                                                }
                                              ]
                                   }))
        
        JoinedStream.end()
            
        if (!args.length) { return JoinedStream }
        args.unshift(msg)
        Select.apply(this, args)

        return JoinedStream
    }
})


