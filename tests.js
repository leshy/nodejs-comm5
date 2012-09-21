var comm = require('./index')
var v = require('validator'); var Validator = v.Validator

exports.Msg = {
    setUp: function (callback) {
        this.Msg = require('./msg').Msg
        callback()
    },
    
    Basic: function (test) {
        var a = new this.Msg({bla : 3})
        test.done()
    }

}


exports.MsgStream = {
    setUp: function (callback) {
        this.stream = require('./msgstream')
        callback()
    },
    
    Basic: function (test) {
        var x = new this.stream.Stream()
        x.subscribe(true,function (msg) { test.done() })
        x.write({bla: 3})
    },

    Linking: function (test) {
        var a = new this.stream.Stream()
        var b = new this.stream.Stream()
        var c = new this.stream.Stream()
        var d = new this.stream.Stream()

        var messages = []
        var messagesc = []

        a.read(function (msg) {
            messages.push(msg)
        })


        c.read(function (msg) {
            messagesc.push(msg)
        })


        a.addchild(b)
        a.addchild(c)
        c.addchild(d)
        
        a.write({msg:1})
        b.write({msg:2})
        c.write({msg:3})
        d.write({msg:4})
        
        test.deepEqual(messages,[{msg:1},{msg:2},{msg:3},{msg:4}])
        test.deepEqual(messagesc,[{msg:3},{msg:4}])
        test.done()
    },

    Ending: { 
        full: function (test) {
            var x = new this.stream.Stream()
            var messages = []

            x.read(function (msg) {
                messages.push(msg)
                
                if(!msg) { 
                    test.deepEqual(messages, [{msg: 1}, {msg: 2}, {msg: 'end' }, undefined])
                    test.done() 
                }
            })

            x.write({msg: 1})
            x.write({msg: 2})
            x.end({msg:"end"})
            
        },


        empty: function (test) {
            var x = new this.stream.Stream()
            var messages = []

            x.read(function (msg) {
                messages.push(msg)
                
                if(!msg) { 
                    test.deepEqual(messages, [{msg: 1}, {msg: 2}, undefined])
                    test.done() 
                }
            })

            x.write({msg: 1})
            x.write({msg: 2})
            x.end()
            
        }
    },


    Oneshot: function (test) {
        var x = new this.stream.Stream()
        var messages = []


        x.readone(function (msg,next) {
            messages.push(msg)
            next()
        })

        test.equals(x.subscribers().length,1)
        
        x.write({msg: 1})
        x.write({msg: 2})
        
        test.deepEqual(messages, [{msg: 1}])
        test.equals(x.subscribers().length,0)
        
        x.readone(function (msg,next) {
            messages.push(msg)
            next()
        })

        x.end()

        test.deepEqual(messages, [{msg: 1}, undefined ])
        
        
        test.done()

    }

}

exports.MsgNode = {
    Connections: function (test) {
        
        var n1 = new comm.MsgNode({name: 'n1'})
        var n2 = new comm.MsgNode({name: 'n2'})
        var n3 = new comm.MsgNode({name: 'n3'})
        var n4 = new comm.MsgNode({name: 'n4'})

        n1.connect(n2)
        n2.connect(n3)
        n2.connect(n4)

        test.equals(n3.hasconnection(n2),true)
        test.equals(n2.hasconnection(n3),true)
        test.equals(n3.hasconnection(n1),false)
        test.equals(n1.hasconnection(n3),false)
        
        test.equals(n1.connections.length,1)
        test.equals(n2.connections.length,3)
        test.equals(n3.connections.length,1)

        test.done()
    },

    BasicComm: function (test) {
        var n1 = new comm.MsgNode({name: 'n1'})
        var n2 = new comm.MsgNode({name: 'n2'})
        var n3 = new comm.MsgNode({name: 'n3'})

        n1.connect(n2)
        n2.connect(n3)

        /*
          this breaks the test, why?
          // this guy will just modify the message
          n2.subscribe({ bla : true, test: Validator().Set("bla") }, function (msg,reply,next,passthrough) {
          next()
          })
        */

        n2.subscribe({ bla : true },function (msg,reply,next,passthrough) {
            reply.write({ response: 1 })
            reply.end({ response: 2 })
            next()
            passthrough()
        })

        n3.subscribe({ bla : true },function (msg,reply,next,passthrough) {
            console.log("N3 PASS")
        })


        n1.subscribe({ response: true },function (msg,reply,next,passthrough) {
            console.log("N1 response sub: ", msg)
        })
        
        n1.msg({bla: 'hi?'}).read(function (msg,reply) {
            console.log("N1 response cb: ",msg)
            test.done()
        })
    }
}
