Backbone = require('backbone');
_ = require('underscore');
decorators = require('decorators');
decorate = decorators.decorate;
async = require('async')
BSON = require('mongodb').BSONPure

helpers = require('helpers')
var v = require('validator'); var Validator = v.Validator; var Select = v.Select
core = require('../core/'); MsgNode = core.MsgNode; Msg = core.Msg


CollectionAbsLayer = exports.CollectionAbsLayer = Backbone.Model.extend4000
    create (data) -> true
    remove (pattern) -> true
    update (pattern,data) -> true
    filter (pattern,limits) -> true

CollectionExposer = exports.CollectionExposer = MsgNode.extend4000
    initialize: ->
        name = @get 'name'
        # filter
        @subscribe { collection: name, filter: "Object", limits: Validator().Default({}).Object() },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then reply.write entry else reply.end

        # update
        @subscribe { collection: name, update: "Object", data: "Object" },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then entry.update(data) else reply.end

        # remove
        @subscribe { collection: name, remove: "Object" },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then entry.remove() else reply.end

        # create
        @subscribe { collection: name, create: "Object" },
            (msg,reply,next,transmit) => @create msg.create, core.msgReplyEnd reply


