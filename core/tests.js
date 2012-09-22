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

    Chaining: function (test) {
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
            
        },

        children: function (test) {


            var a = new this.stream.Stream({name: 'a'})
            var b = new this.stream.Stream({name: 'b'})
            var c = new this.stream.Stream({name: 'c'})
            var d = new this.stream.Stream({name: 'd'})
            
            a.addchild(b)
            a.addchild(c)
            c.addchild(d)

            var endings = []
            
            a.on('children_end', function () { endings.push('a children') })
            a.on('end', function () { endings.push('a') })

            b.on('children_end', function () { endings.push('b children') })
            b.on('end', function () { endings.push('b') })

            c.on('children_end', function () { endings.push('c children') })
            c.on('end', function () { endings.push('c') })

            d.on('children_end', function () { endings.push('d children') })
            d.on('end', function () { endings.push('d') })
            
            a.write({msg:1})
            b.write({msg:2})
            c.write({msg:3})
            d.write({msg:4})
            
            d.end()
            c.end()
            b.end()
            a.end()
            
            test.deepEqual([ 'd', 'c children', 'c', 'b', 'a children', 'a' ],endings)

            test.done()
        }

        
    },


    Oneshot: function (test) {
        var x = new this.stream.Stream()
        var messages = []


        x.readOne(function (msg,next) {
            messages.push(msg)
            next()
        })

        test.equals(x.subscribers().length,1)
        
        x.write({msg: 1})
        x.write({msg: 2})
        
        test.deepEqual(messages, [{msg: 1}])
        test.equals(x.subscribers().length,0)
        
        x.readOne(function (msg,next) {
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

    LocalComm: function (test) {
        var n1 = new comm.MsgNode({name: 'n1'})

        n1.subscribe({ bla : true },function (msg,reply,next) {
//            console.log("GOT",msg)
            reply.write({ response: 1 })
            reply.end({ response: 2 })
//            next()
        })
        
        n1.subscribe({ response: true },function (msg,reply,next) {
            console.log("N1 response sub: ", msg)
        })

        var stream = n1.msg({bla: 'hi?'})
        
        stream.readOne(function (msg,reply) {
            //console.log("N1 response cb: ",msg)
            test.done()
        },{ response: 2})

    },

    RemoteComm: function (test) {

        var n1 = new comm.MsgNode({name: 'n1'})
        var n2 = new comm.MsgNode({name: 'n2'})

        n1.connect(n2)

        n2.subscribe({ bla : true },function (msg,reply,next,transmit) {
            reply.write({ response: 1 })
            reply.end({ response: 'end' })
        })

        n1.subscribe(true, function (msg,reply,next,transmit) { transmit(); reply.end() })

        var stream = n1.msg({bla: 'hi?'})
        
        stream.readOne(function (msg,reply) {
            test.done()
        },{ response: Validator().String('end')})
    }
}

