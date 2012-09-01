
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


var MsgNode = Backbone.Model.extend4000(
    graph.GraphNode,
    MsgSubscriptionMan,
    {
        initialize: function () {
            
            
        }
    })



