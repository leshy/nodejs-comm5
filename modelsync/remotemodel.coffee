Backbone = require 'backbone4000'
_ = require 'underscore'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
decorators = require 'decorators'; decorate = decorators.decorate;
SubscriptionMan = require('subscriptionman').SubscriptionMan

# knows about its collection, knows how to store/create itself and defines the permissions
RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000
    validator: v { collection: 'instance' }
    
    initialize: ->
        @collection = @get 'collection'
        @when 'id', =>
            @collection.subscribe { id: @id }
            @on 'change', @changed

    changed: (model,data) -> @flush()

    export: (realm) ->
        return _.omit(@attributes,'collection')

    update: (data) -> @set(data)
        
    flush: decorate( decorators.MakeDecorator_Throttle({ throttletime: 1 }), (callback) -> @flushnow(callback) )

    flushnow: (callback) ->
        if not id = @get 'id'
            @collection.create @export('store'), (err,id) => @set 'id', id; callback()
        else
            @collection.update {id: id}, @export('store'), callback

    remove: (callback) ->
        @trigger('remove')
        if id = @get 'id' then @collection.remove {id: id}, callback else callback()
    
# this can be mixed into a RemoteCollection or Collection itself, it adds findModel method that automatically instantiates propper models for query results
ModelMixin = exports.ModelMixin = Backbone.Model.extend4000
    initialize: ->
        @models = {}
        
    defineModel: (name,superclasses...,definition) ->
        if not definition.defaults? then definition.defaults = {}
        definition.defaults.collection = this
        definition.defaults.type = name
        @models[name] = RemoteModel.extend4000.apply(RemoteModel,helpers.push(superclasses,definition))
    resolveModel: (entry) ->
        if @models.length is 1 then return @models[0]
        if (entry.type) then return @models[entry.type]
   
    findModels: (pattern,limits,callback) ->
        @find pattern,limits,(entry) =>
            if not entry? then callback() else callback(new (@resolveModel(entry))(entry))



SubscriptionMixin = exports.SubscriptionMixin = Backbone.Model.extend4000
    initialize: ->
        @subscriptions = new SubscriptionMan()

    subscribe: ->
        true

    unsubscribe: ->
        true
