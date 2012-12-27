var _ = require('underscore')
var decorators = require('decorators')
var decorate = decorators.decorate
var Validator = require('validator2-extras').Validator
var Stream = require('./msgstream').Stream
var helpers = require('helpers')

function Msg(data) {
    var self = this;
    var idlen = 15

    new Validator().Default({}).Children({
        meta: new Validator().Default({}).Children({ 
            id: new Validator().Default(function () {return helpers.generateid(idlen)}).Length({maximum: idlen, minimum: idlen}),
            timestamp: new Validator().Default(function () {return new Date().getTime()}),
            breadcrumbs: new Validator().Default([]).Array()
        })
    }).feed(data,function (err,data) {
        if (err) { throw err;return }
        _.extend(self,data)
    })
}

Msg.prototype.makeReplyStream = function () {
    var replystream = new Stream()
    /*
    var self = this
    replystream.read(function (msg) {
        msg.meta.replyto = self.meta.id
        msg.meta.path = helpers.copy(self.breadcrumbs).reverse()
    })
    */
    return replystream
}


Msg.prototype.render = function() { 
    data = {}
    _.map(this,function (value,name) { if (name != "meta") { data[name] = value} })
    return data
}

Msg.prototype.json = function () { return JSON.stringify(this.render()) }

exports.Msg = Msg

var a = new Msg({bla: 3})


