var Backbone = require('backbone4000')
var _ = require('underscore')
var SubscriptionMan = require('subscriptionman').SubscriptionMan
var graph = require('graph')

/*

this one is simple..

stream is something that gets returned when you send a message via msgnode
or it is a thing you receive when you are replying to one.

you can write to a stream or you can read from it, when reading you can subscribe to particular messages.


you can link streams by calling add on them

*/

var Stream = exports.Stream = Backbone.Model.extend4000(
    SubscriptionMan, graph.DirectedGraphNode,
    {
        initialize: function () {
            var self = this
            this.children.on('msg',function (msg) { self.msg(msg) })
            
            this.children.on('add', function () {
                if (!this.childrencounter) { this.childrencounter = 1 } else { this.childrencounter ++; }
            }.bind(this) )
            
            this.children.on('end',function () { 
                this.childrencounter --;
                if (!this.childrencounter) { this.trigger('children_end')}
            }.bind(this))
            
        },

        write: function (msg) {
            if (this._ended) { throw "you tryed to write to an ended stream" }
            this.msg(msg)
        },
        
        end: function (msg) {
            if (msg) { this.write(msg) }
            this._ended = true
            this.endBroadcast()
        },
        
        endBroadcast: function () {
            if (this.ended()) { 
                _.map(this.subscribers(), function (subscriber) { subscriber.callback(undefined,function () {}) })
                this.trigger('end')
            }
        },
        
        ended: function () {
            if (this._ended && (!this.childrencounter)) { return true } else { return false }
        },
                
        read: function (callback,pattern) {
            if (!pattern) { pattern = true }
            return this.subscribe(pattern,callback)
        },
        
        readOne: function (callback,pattern) {
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

