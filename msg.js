var _ = require('underscore')
var uuid = require('uuid')
var decorators = require('decorators')
var decorate = decorators.decorate
var Validator = require('validator').Validator

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
    var queryidlen = 15

    Validator().Default({}).Children({
        meta: Validator().Default({}).Children({ 
            queryid: Validator().Default(function () {return uuid.uuid(queryidlen)}).Length({maximum: queryidlen, minimum: queryidlen}),
            timestamp: Validator().Default(function () {return new Date().getTime()}),
            breadcrumbs: Validator().Default([]).Array(),
            target: Validator().Default([]).Array()
        })
    }).feed(data,function (err,data) {
        if (err) { throw err;return }
        _.extend(self,data)
    })
}

Msg.prototype.enternode = function (node) {
    breadcrumbs.push(node)
    if (this.target.length) {
        if (this.target.pop() != node) { 
            throw "wtf, I'm taking a wrong path"
        }
    }
}


// creates an appropriate reply message for this message,
// (populates _viral, queryid and such)
Msg.prototype.makereply = decorate(MakeObjReceiver(Msg),function(msg) {
    if (!msg) { return }
    if (!msg.queryid) { msg.queryid = this.queryid }
    msg._viral = _.extend(msg._viral,this._viral)
    return msg
})

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
