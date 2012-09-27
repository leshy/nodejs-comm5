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

exports.Speed = function (test) {
    var n = 25
    var n1 = new comm.MsgNode({name: 'n1'})
    var borderman = new comm.BorderMan({name: 'borderman', realm: 'testrealm'})
    var n2 = new comm.MsgNode({name: 'n2'})
    
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
            test.done()
        }
        reply.end()
    })

    n1.subscribe(true, function (msg,reply,next,transmit) { transmit(); reply.end() })

    var x = 0
    while (x < n) {
        x++
        n1.msg({bla: x})
    }
}

exports.Http = function (test) {
    var express = require('express');
    var http = require('./http')
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



