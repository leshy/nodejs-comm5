Backbone = require('backbone');
_ = require('underscore');
decorators = require('decorators');
decorate = decorators.decorate;
async = require('async')
BSON = require('mongodb').BSONPure
helpers = require('helpers')

v = require('validator')
Validator = v.Validator
Select = v.Select

core = require('../core/'); MsgNode = core.MsgNode; Msg = core.Msg


CollectionAbsLayer = exports.CollectionAbsLayer = Backbone.Model.extend4000
    create: (data) -> true
    remove: (pattern) -> true
    update: (pattern,data) -> true
    filter: (pattern,limits) -> true


RemoteCollection = Backbone.Model.extend4000 CollectionAbsLayer, v.ValidatedModel, MsgNode,
    validator: Validator (name: "String")
    create: (data) -> @send( collection: @get('name'), create: data )
    remove: (pattern) -> @send( collection: @get('name'), remove: pattern )
    update: (pattern,data) -> @send( collection: @get('name'), remove: pattern )
    filter: (pattern,limits) -> @send( collection: @get('name'), filter: pattern )


CollectionExposer = exports.CollectionExposer = MsgNode.extend4000
    initialize: ->
        name = @get 'name'

        # create
        @subscribe { collection: name, create: "Object" },
            (msg,reply,next,transmit) => @create msg.create, core.msgReplyEnd reply

        # remove
        @subscribe { collection: name, remove: "Object" },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then entry.remove() else reply.end

        # update
        @subscribe { collection: name, update: "Object", data: "Object" },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then entry.update(data) else reply.end

        # filter
        @subscribe { collection: name, filter: "Object", limits: Validator().Default({}).Object() },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then reply.write entry else reply.end


