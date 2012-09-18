var _ = require('underscore')
var decorators = require('decorators')
var decorate = decorators.decorate
var Validator = require('validator').Validator
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
    var idlen = 10

    Validator().Default({}).Children({
        meta: Validator().Default({}).Children({ 
            id: Validator().Default(function () {return helpers.generateid(idlen)}).Length({maximum: idlen, minimum: idlen}),
            timestamp: Validator().Default(function () {return new Date().getTime()}),
            breadcrumbs: Validator().Default([]).Array(),
            target: Validator().Default([]).Array()
        })
    }).feed(data,function (err,data) {
        if (err) { throw err;return }
        _.extend(self,data)
    })
}

Msg.prototype.makereply = function () {
    var replystream = new Stream()
    var self = this
    replystream.read(decorate(MakeObjReceiver(msg), function (msg) {
        msg.meta.replyto = self.meta.id
        msg.meta.path = helpers.copy(self.breadcrumbs).reverse()
    }))
}

Msg.prototype.export = function() { 
    var data = _.clone(this)    
    delete data['_viral']
    delete data['_meta']
    return data
}

Msg.prototype.render = function() { 
    return JSON.stringify(this.export())
}


exports.Msg = Msg


var a = new Msg({bla: 3})


