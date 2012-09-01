
var SubscriptionMan = require('subscriptionman2').SubscriptionMan
var Msg = require('./msg').Msg


var MakeObjReceiver = function(objclass) {
    return function() {
        var args = toArray(arguments);
        var f = args.shift();
        if ((!args.length) || (!args[0])) { f.apply(this,[]); return }
        if (args[0].constructor != objclass) { args[0] = new objclass(args[0]) }
        return f.apply(this,args)
    }
}


var MsgSubscriptionMan = SubscriptionMan.extend4000({
    msg: decorate(MakeObjReceiver(Msg), function(msg) {
        return SubscriptionMan.prototype.msg.apply(this,arguments)
    })
})


// backbone model that uses validator on its own attributes (for initialization)
// feed call in this case should BLOCK. at least on the level of this object's init.. 
// we don't want other subclassed initialize functions to be called until verification is complete
var ValidatedObject = Backbone.Model.extend4000({
    initialize: function () {
        var validator 
        if (validator = this.get('validator')) {
            Validator(validator).feed(this.attributes,function (err,data) { if (err) { throw err } })
        }
    }
})

var MsgNode = Backbone.Model.extend4000(
    graph.GraphNode,
    MsgSubscriptionMan,
    {
        initialize: function () {
            
            
        }
        
    })


var x = new MsgNode()


// sets realm for a message to be this.attributes.realm, 
// passes it to other potential local subscribers and broadcasts message to other nodes connected to this node
var BorderGuard = Backbone.Model.extend4000(
    MsgNode,
    ValidatedObject,
    {        
        validator: Validator({ realm: "String" }),

        initialize: function () {
            var self = this
            self.subscribe({ realm: Validator().Set(self.get('realm')) },function (msg,next,pass) {
                pass()
                next()
            })
        }
    })


