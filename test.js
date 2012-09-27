var comm = require('./core')
var v = require('validator'); var Validator = v.Validator

var express = require('express');
var http = require('./http')
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
    next()
    reply.write({oh:'hi'})
    reply.end({bla: '33'})
})

server.connect(responder)

