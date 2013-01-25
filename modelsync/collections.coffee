# warning, need collection level permissions for raw update calls...
#
# also, I need to propperly propagade findOne errors, not emulate them on RemoteCollection side..
# 


Backbone = require 'backbone4000'
_ = require 'underscore'
decorators = require 'decorators'; decorate = decorators.decorate;
async = require 'async'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select

core = require '../core/'; MsgNode = core.MsgNode; Msg = core.Msg
RemoteModel = require('./remotemodel').RemoteModel
SubscriptionMan = require('subscriptionman').SubscriptionMan
    
# exposes a collection with a standard interface to comm5 messaging layer
CollectionExposer = exports.CollectionExposer = MsgNode.extend4000
    defaults: { name: undefined }
    initialize: ->
        name = @get 'name'

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
            (msg,reply,next,transmit) => @findModels(msg.find).each (entry) =>
                if entry? then entry.remove() else reply.end()

        # update
        @subscribe { collection: name, update: "Object", data: "Object" },
            (msg,reply,next,transmit) => @findModels(msg.find).each (entry) =>
                if entry? then entry.update(data,msg.realm); entry.flush() else reply.end()
        
        # find
        @subscribe { collection: name, find: "Object", limits: v().Default({}).Object() },
            (msg,reply,next,transmit) => @find msg.find, msg.limits, (entry) =>
                if entry? then reply.write ({ data: entry, err: undefined }) else reply.end()

        # findOne
        @subscribe { collection: name, findOne: "Object" },
            (msg,reply,next,transmit) => @findOne msg.findOne, (err, entry) =>
                if entry? then reply.write ({ data: entry, err: undefined }) else reply.end()
                
        # subscribe to specific model changes/broadcasts
        @subscribe { collection: name, subscribe: "Object", tags: "Array" },
            (msg,reply,next,transmit) => @subscribe msg.subscribe, (event,eventreply,eventnext) => reply.write(event); eventreply.end(); eventnext()
            # this wont work for remote collections?

        # call
        @subscribe { collection: name, call: "String", data: "Object" },
            (msg,reply,next,transmit) => @fcall msg.call, msg.args or [], msg.data, msg.realm, (err,data) ->
                if (err or data) then reply.write { err: err, data: data } else reply.end()

# this can be mixed into a RemoteCollection or Collection itself.
# it provides subscribe and unsubscribe methods for collection events (remove/update/create)
# 
# if this is mixed into a collection,
# remotemodels will automatically subscribe to those events to update themselves with potential remote changes
SubscriptionMixin = exports.SubscriptionMixin = Backbone.Model.extend4000
    superValidator: v({ create: 'function', update: 'function', remove: 'function' })

    create: (entry,callback) ->
        @_super 'create', entry, (err,id) =>
            @msg { collection: @get('name'), action: 'create', entry: _.extend({id : id}, entry) }
            callback(err,id)
        
    update: (pattern,update,callback) ->
        @_super 'update', pattern, update, callback
        @msg { collection: @get('name'), action: 'update', pattern: pattern, update: update }
        
    remove: (pattern,callback) ->
        @_super 'remove', pattern, callback
        @msg { collection: @get('name'), action: 'remove', pattern: pattern }

    subscribechanges: (pattern,callback,name) ->
        @subscribe { pattern: pattern }, (msg,reply,next,transmit) -> reply.end(); next(); transmit(); callback(msg);
        
    unsubscribechanges: ->
        true

# global dict holding all collections
exports.collectionDict = {}

UnresolvedRemoteModel = Backbone.Model.extend4000
    collection: undefined
    id: undefined
    
    toString: -> 'unresolved model ' + @get('id') + ' of collection ' + @get('collection').name()
    
    resolve: (callback) ->
        collection = @get 'collection'
        collection.findOne {id: @get 'id'}, (err,entry) =>
            if not entry then callback('unable to resolve reference to ' + @get('id') + ' at ' + collection.name())
            else 
                @morph collection.resolveModel(entry), entry
                callback @
        
    morph: (myclass,mydata) ->
        @attributes = mydata
        @__proto__ = myclass::

ReferenceMixin = exports.ReferenceMixin = Backbone.Model.extend4000
    initialize: ->
        @collectionDict = exports.collectionDict
        @when 'name', (name) => @collectionDict[name] = @

    getcollection: (name) -> @collectionDict[name]

    unresolved: (id) -> new UnresolvedRemoteModel id: id, collection: @


# this can be mixed into a RemoteCollection or Collection itself
# it adds findModel method that automatically instantiates propper models for query results
ModelMixin = exports.ModelMixin = Backbone.Model.extend4000
    initialize: ->
        @models = {}

    defineModel: (name,superclasses...,definition) ->
        if not definition.defaults? then definition.defaults = {}
        definition.defaults.collection = this
        definition.defaults._t = name
        @models[name] = RemoteModel.extend4000.apply RemoteModel, superclasses.concat(definition)
        
    resolveModel: (entry) ->
        keys = _.keys(@models)
        if keys.length is 0 then throw "I don't have any models defined"
        if keys.length is 1 or not entry._t? then return @models[_.first(keys)]
        if entry._t and tmp = @models[entry._t] then return tmp
        throw "unable to resolve " + JSON.stringify(entry) + " " + _.keys(@models).join ", "

    findModels: (pattern,limits,callback) ->
        @find pattern,limits,(entry) =>
            if not entry? then callback() else callback(new (@resolveModel(entry))(entry))

    findModel: (pattern,callback) ->
        @findOne pattern, (err,entry) =>
            if (not entry? or err) then callback() else callback(undefined,new (@resolveModel(entry))(entry))

    fcall: (name,args,pattern,realm,callback) ->
        @findModels pattern, {}, (model) ->
            if model? then model.remoteCallReceive name, args, realm, (err,data) -> callback err, data
            else callback() # this is problematic, if function is async, empty callback() will be called before the functions have finished execution which will cause a premature reply.end()
            
# has the same interface as local collections but it transparently talks to the remote collectionExposer via the messaging system,
RemoteCollection = exports.RemoteCollection = Backbone.Model.extend4000 ModelMixin, ReferenceMixin, SubscriptionMixin, Validator.ValidatedModel, MsgNode,
    validator: v(name: "String")
            
    create: (entry,callback) -> core.msgCallback @send( collection: @get('name'), create: entry ), callback
    
    remove: (pattern,callback) -> core.msgCallback @send( collection: @get('name'), remove: pattern, raw: true ), callback
    
    update: (pattern,data,callback) -> core.msgCallback @send( collection: @get('name'), update: pattern, data: data, raw: true ), callback
    
    find: (pattern,limits,callback) ->
        reply = @send( collection: @get('name'), find: pattern, limits: limits )
        reply.read (msg) -> if msg then callback(msg.data) else callback()

    findOne: (pattern,callback) ->
        reply = @send( collection: @get('name'), findOne: pattern )
        reply.read (msg) -> if msg then callback(undefined,msg.data) else callback("not found")

    fcall: (name, args, pattern, callback) ->
        reply = @send( collection: @get('name'), call: name, args: args, data: pattern )
        reply.read (msg) -> if msg then helpers.cbc callback, msg.err, msg.data;

