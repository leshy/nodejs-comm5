var Backbone = require('backbone4000')
var _ = require('underscore')
var SubscriptionMan = require('subscriptionman').SubscriptionMan


/*

this one is simple..

stream is something that gets returned when you send a message via msgnode
or it is a thing you receive when you are replying to one.

you can write to a stream or you can read from it, when reading you can subscribe to particular messages.

*/

var Stream = exports.Stream = SubscriptionMan.extend4000({    
    write: function (msg) {
        if (this.ended) { throw "someone tryed to write to an ended stream" }
        this.msg(msg)
    },
    
    end: function (msg) {
        if (msg) { this.write(msg) }
        this.ended = true
        // send empty data to all subscribers letting them know that this stream is closed
        _.map(this.subscribers(), function (subscriber) { subscriber.callback(undefined,function () {}) }) 
    },
    
    read: function (callback,pattern) {
        if (!pattern) { pattern = true }
        return this.subscribe(pattern,callback)
    },
    
    readone: function (callback,pattern) {
        if (!pattern) { pattern = true }
        return this.oneshot(pattern,callback)
    }    
})

// if there are no subscriptions bufferstream will fill its internal buffer until someone is subscribed, then it will flush.
var BufferStream = exports.BufferStream = SubscriptionMan.extend4000({
    bufferadd: function (msg) {
        var self = this
        
        if (!this.bladder) { 
            this.bladder = [] 
            this.oneshot('subscribe',function () { self.emptybladder() })
        }
        this.bladder.push(msg)
    },

    emptybladder: function () {
        if (!this.bladder) { throw "I have no buffer man" }
        while (this.bladder.length) { Stream.prototype.write.call(this,this.bladder.shift()) }
        delete this.bladder
    },
    
    write: function (msg) {
        if (!this.subscribers()) { this.bladderadd(msg) } else { Stream.prototype.write.call(this,msg) }
    }
})

