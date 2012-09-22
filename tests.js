var comm = require('./core')
var v = require('validator'); var Validator = v.Validator


exports.BorderMan = function (test) {
    
    var n1 = new comm.MsgNode({name: 'n1'})
    var borderman = new comm.BorderMan({name: 'borderman', realm: 'testrealm'})
    var n2 = new comm.MsgNode({name: 'n2'})
    
    n1.connect(borderman)
    borderman.connect(n2)

    n2.subscribe({ bla : true, realm: Validator().String("testrealm") },function (msg,reply,next,transmit) {
        next()
        reply.write({ response: 1 })
        reply.end({ response: 2 })
    })

    n2.subscribe({ bla : true, realm: Validator().String("testrealm") },function (msg,reply,next,transmit) {
        next()
        reply.end({ response: 'end' })
    })


    n1.subscribe(true, function (msg,reply,next,transmit) { transmit(); reply.end() })

    var stream = n1.msg({bla: 'hi?'})
    stream.readOne(function (msg,reply) {
        test.done()
    },{ response: Validator().String('end')})
}

