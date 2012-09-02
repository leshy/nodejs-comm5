

var comm = require('./index')



exports.BasicComm = function (test) {
    
    var n1 = new comm.MsgNode({name: 'n1'})
    var n2 = new comm.MsgNode({name: 'n2'})
    var n3 = new comm.MsgNode({name: 'n3'})

    n1.connect(n2)
    n2.connect(n3)
    
    n2.subscribe({ bla : true },function (msg,next,passthrough) {
        
    })

    n3.subscribe({ bla : true },function (msg,next,passthrough) {
        console.log("N3 PASS")
    })
    
    
    test.done()
}
