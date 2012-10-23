Backbone = require 'backbone4000'
_ = require 'underscore'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
decorators = require 'decorators'; decorate = decorators.decorate;

# knows about its collection, knows how to store/create itself and defines the permissions
RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000
    validator: v { collection: 'instance' }
    
    initialize: ->
        @collection = @get 'collection'
        @when 'id', =>
            @collection.subscribe { id: @id }
            @on 'change', @changed

    changed: (model,data) -> @flush()

    export: (realm) -> _.omit(@attributes,'collection')

    update: (data) -> @set(data)
        
    flush: decorate( decorators.MakeDecorator_Throttle({ throttletime: 1 }), (callback) -> @flushnow(callback) )

    flushnow: (callback) ->
        if not id = @get 'id' then @collection.create @export('store'), (err,id) => @set 'id', id; callback()
        else @collection.update {id: id}, @export('store'), callback

    remove: (callback) ->
        @trigger('remove')
        if id = @get 'id' then @collection.remove {id: id}, callback else callback()
    
