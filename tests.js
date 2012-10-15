var comm = require('./core')
var v = require('validator'); var Validator = v.Validator
var helpers = require('helpers')
var _ = require('underscore')

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

exports.SpeedLeak = function (test) {
    var n = 100
    var n1 = new comm.MsgNode({name: 'n1'})
    var borderman = new comm.BorderMan({name: 'borderman', realm: 'testrealm'})
    var n2 = new comm.MsgNode({name: 'n2'})
    var firstmem = process.memoryUsage().rss
    var memlog = []

    n1.connect(borderman)
    borderman.connect(n2)
    
    n2.subscribe({ bla : true, realm: Validator().String("testrealm") },function (msg,reply,next,transmit) {
        next()
        reply.write({ response: msg.bla })
        reply.end({ response: msg.bla + 1 })
    })

    n2.subscribe({ bla : true, realm: Validator().String("testrealm") },function (msg,reply,next,transmit) {
        next()
        if (msg.bla == n) { 
            console.log('mem:'.green,_.last(memlog))
            test.equals(false, (_.last(memlog) < 50000))
            test.done()
        }
        reply.end()
    })

    n1.subscribe(true, function (msg,reply,next,transmit) { transmit(); reply.end() })

    var x = 0
    while (x < n) {
        x++
        n1.msg({bla: x})
        var mem = process.memoryUsage().rss
        memlog.push(mem - firstmem)
        lastmem = mem
    }
    
    

}

exports.Http = function (test) {
    var express = require('express');
    var http = require('./serverside/http')
    var request = require('request')
    var app = express.createServer();


    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser());
        app.use(app.router);
        app.use(express.static(__dirname + '/static'));
    });

    app.listen(8000);

    var server = new http.HttpServer({express: app, name: "http"})
    
    var responder = new comm.MsgNode({name: "echo"})
    
    responder.subscribe(true,function (msg,reply,next,transmit) {
        try {
            next()
            reply.write({oh:'hi'})
            reply.end({bla: '33'})
        } catch(err) { console.log("ERR",err)} 
    })
    
    request('http://localhost:8000', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            test.deepEqual(_.map(helpers.trim(body).split('\n'), function (string) { return JSON.parse(string)}), [ { oh: 'hi' }, { bla: '33' } ])
            app.close()
            test.done()
        }
    })

    server.connect(responder)
}


exports.Nssocket = function (test) {

    var s = require('./serverside/nssocketWrapper')

    var ServerNode = new s.nssocketServer({ realm: 'tcp', port: 6785 })
    
    ServerNode.newClient(function (client) {
        client.subscribe(true,function (msg,reply,next,transmit) {
            reply.write({pong: 1})
            reply.end({pong: 2})
        })
        
    })
    
    
    ServerNode.listen(6785);

    
    var ClientNode = new s.nssocketClient({ realm: 'tcp'});
    
    messages = []

    ClientNode.msg({bla: 333}).read(function (msg,reply) {
        if (msg) { 
            messages.push(msg.pong)
        } else {
            test.deepEqual([1,2],messages)
            ClientNode.end()
            ServerNode.end()
            test.done()
        }
    })

    ClientNode.connect('localhost',6785);

}


