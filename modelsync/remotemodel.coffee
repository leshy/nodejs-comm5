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
        @when 'id', (id) =>
            @collection.subscribechanges { id: id }, @remoteChange.bind(@)
            #@on 'change', @changed

    remoteChange: (change) -> 
        switch change.action
            
            when 'update' then console.log("SETTING",@get('bla'), change.update); @set change.update, { silent: true }
        
    changed: (model,data) -> true #@flush()

    export: (realm) -> _.omit(@attributes,'collection')

    update: (data) -> @set(data)
    
    # simplified for now, will reintroduce when done with model syncing
    #flush: decorate( decorators.MakeDecorator_Throttle({ throttletime: 1 }), (callback) -> @flushnow(callback) )
    flush: (callback) -> @flushnow(callback)

    flushnow: (callback) ->
        if not id = @get 'id' then @collection.create @export('store'), (err,id) => @set 'id', id; callback(err,id)
        else @collection.update {id: id}, @export('store'), callback

    remove: (callback) ->
        @trigger('remove')
        if id = @get 'id' then @collection.remove {id: id}, callback else callback()
    
