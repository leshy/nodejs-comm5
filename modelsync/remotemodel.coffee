Backbone = require 'backbone4000'
_ = require 'underscore'
decorators = require 'decorators'
decorate = decorators.decorate;
async = require 'async'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select

RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000
    validator: v { collection: 'instance' }
    
    initialize: ->
        @collection = @get 'collection'
        #@when 'id', => @collection.subscribe { id: @id }
        

# this can be mixed into a RemoteCollection or Collection itself, it automatically instantiates
# propper models for collection queries
RemoteModelMixin = exports.RemoteModelMixin = Backbone.Model.extend4000
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
       

