var SubscriptionMan = require('subscriptionman').SubscriptionMan
var Stream = require('stream')
var _ = require('underscore')

exports.StreamingSubscriptionMan = SubscriptionMan.extend4000({
    msg: function (msg) {
        
        
    }
})

var x = new Stream()

console.log(x.writable)
x.write("BLA")
