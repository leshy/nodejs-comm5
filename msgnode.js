
var MakeObjReceiver = function(objclass) {
    return function() {
        var args = toArray(arguments);
        var f = args.shift();
        if ((!args.length) || (!args[0])) { f.apply(this,[]); return }
        if (args[0].constructor != objclass) { args[0] = new objclass(args[0]) }
        return f.apply(this,args)
    }
}




var MsgNode = Backbone.Model.extend4000(
    graph.GraphNode,
    MsgSubscriptionManAsync,
    {
        initialize: function () {
            
            
        }
    })



var x = new MsgNode()


x.allow({ bla: true })



x.subscribe( { bla: is("xxx").or( agdsgdsa  , asdgasgd  ) } ) 
