Backbone = require 'backbone'
_ = require 'underscore'
decorators = require 'decorators'
decorate = decorators.decorate;
async = require 'async'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select

core = require '../core/'; MsgNode = core.MsgNode; Msg = core.Msg
SubscriptionMan = require('subscriptionman').SubscriptionMan

CollectionAbsLayer = exports.CollectionAbsLayer = Backbone.Model.extend4000
    create: (data) -> true
    remove: (pattern) -> true
    update: (pattern,data) -> true
    filter: (pattern,limits) -> true

# talks to the collection that's away, pretends to be local
RemoteCollection = Backbone.Model.extend4000 CollectionAbsLayer, Validator.ValidatedModel, MsgNode,
    validator: v(name: "String")
    create: (data) -> @send( collection: @get('name'), create: data )
    remove: (pattern) -> @send( collection: @get('name'), remove: pattern )
    update: (pattern,data) -> @send( collection: @get('name'), remove: pattern )
    filter: (pattern,limits) -> @send( collection: @get('name'), filter: pattern )

# exposes collectionAbsLayer with messages
CollectionExposer = exports.CollectionExposer = MsgNode.extend4000
    initialize: ->
        name = @get 'name'

        @subscriptions = new SubscriptionMan()
        
        # create
        @subscribe { collection: name, create: "Object" },
            (msg,reply,next,transmit) => @create msg.create, core.callbackMsgEnd reply
        
        # remove
        @subscribe { collection: name, remove: "Object" },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then entry.remove() else reply.end
        
        # update
        @subscribe { collection: name, update: "Object", data: "Object" },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then entry.update(data) else reply.end
        
        # filter
        @subscribe { collection: name, filter: "Object", limits: v().Default({}).Object() },
            (msg,reply,next,transmit) => @filter(msg.filter).each (entry) =>
                if entry? then reply.write entry else reply.end

        # subscribe to specific model changes/broadcasts
        @subscribe { collection: name, subscribe: "Object" },
            (msg,reply,next,transmit) => 

