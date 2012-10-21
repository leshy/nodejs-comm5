Backbone = require 'backbone4000'
_ = require 'underscore'
decorators = require 'decorators'
decorate = decorators.decorate;
async = require 'async'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select

core = require '../core/'; MsgNode = core.MsgNode; Msg = core.Msg
SubscriptionMan = require('subscriptionman').SubscriptionMan

###
CollectionAbsLayer = exports.CollectionAbsLayer = Backbone.Model.extend4000
    create: (entry,callback) -> console.log 'not implemented'
    remove: (pattern,callback) -> console.log 'not implemented'
    update: (pattern,data,callback) -> console.log 'not implemented'
    find: (pattern,limits,callback) -> console.log 'not implemented'
###

# talks to the collection that's away, pretends to be local
RemoteCollection = exports.RemoteCollection = Backbone.Model.extend4000 Validator.ValidatedModel, MsgNode,
    validator: v(name: "String")
    create: (entry,callback) -> core.msgCallback @send( collection: @get('name'), create: entry ), callback
    remove: (pattern,callback) -> core.msgCallback @send( collection: @get('name'), remove: pattern, raw: true ), callback
    update: (pattern,data,callback) -> core.msgCallback @send( collection: @get('name'), update: pattern, data: data, raw: true ), callback
    find: (pattern,limits,callback) ->
        reply = @send( collection: @get('name'), find: pattern, limits: limits )
        reply.read (msg) -> if msg then callback(msg.data) else callback()

# exposes collectionAbsLayer with messages
CollectionExposer = exports.CollectionExposer = MsgNode.extend4000
    defaults: { name: undefined }
    initialize: ->
        name = @get 'name'
        @subscriptions = new SubscriptionMan()
        
        # create
        @subscribe { collection: name, create: "Object" },
            (msg,reply,next,transmit) => @create msg.create, core.callbackMsgEnd reply
        

        # remove raw
        @subscribe { collection: name, remove: "Object", raw: true  },
            (msg,reply,next,transmit) => @remove msg.remove, core.callbackMsgEnd reply

        # update raw
        @subscribe { collection: name, update: "Object", data: "Object" },
            (msg,reply,next,transmit) => @update msg.update, msg.data, core.callbackMsgEnd reply
            
        # remove
        @subscribe { collection: name, remove: "Object" },
            (msg,reply,next,transmit) => @find(msg.find).each (entry) =>
                if entry? then entry.remove() else reply.end

        # update
        @subscribe { collection: name, update: "Object", data: "Object" },
            (msg,reply,next,transmit) => @find(msg.find).each (entry) =>
                if entry? then entry.update(data) else reply.end
        
        # find
        @subscribe { collection: name, find: "Object", limits: v().Default({}).Object() },
            (msg,reply,next,transmit) => @find msg.find, msg.limits, (entry) =>
                if entry? then reply.write ({ data: entry, err: undefined }) else reply.end()

        # subscribe to specific model changes/broadcasts
        @subscribe { collection: name, subscribe: "Object" },
            (msg,reply,next,transmit) => true

