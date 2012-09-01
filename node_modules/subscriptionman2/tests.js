/*
  nodeunit tests
  https://github.com/caolan/nodeunit/

*/

var subscriptionman = require("./index.js")

exports.basic = function (test) {

    var x = new subscriptionman.SubscriptionMan()
    var bla = []
    
    x.subscribe({bla: true},function (msg,next) { 
        bla.push(msg)
        next()
    })
    
    x.subscribe({bla: "String"},function (msg,next) { 
        bla.push('string')
        test.fail('matched string but given a Number!')
    })
    
    x.subscribe({bla: "Number"},function (msg,next) { 
        bla.push('number')
        test.equals(JSON.stringify(bla),'[{"bla":3},"number"]')
        test.done()
    })    
    
    x.msg({bla: 3})
    
}
