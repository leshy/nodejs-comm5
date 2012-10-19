var _ = require('underscore')
var decorators = require('decorators')
var decorate = decorators.decorate
var Validator = require('validator2-extras').Validator
var Stream = require('./msgstream').Stream
var helpers = require('helpers')

// metadecorator for message receiving functions, 
// it just subclasses a message class if it receives a plain dictionary
// used to be able to call bla.send({lala: 3}) instead of bla.send(new Msg({lala:3}))
var MakeObjReceiver = function(objclass) {
    return function() {
        var args = toArray(arguments);
        var f = args.shift();
        if ((!args.length) || (!args[0])) { f.apply(this,[]); return }
        if (args[0].constructor != objclass) { args[0] = new objclass(args[0]) }
        return f.apply(this,args)
    }
}

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

exports.Msg = Msg

var a = new Msg({bla: 3})


