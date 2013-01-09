Backbone = require 'backbone4000'
_ = require 'underscore'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
decorators = require 'decorators'; decorate = decorators.decorate;

# knows about its collection, knows how to store/create itself and defines the permissions
RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000
    validator: v { collection: 'instance' }
    
    initialize: ->
        # this is temporary, permission system will make sure that this is never exported
        @when 'collection', (collection) =>
            @unset 'collection'
            @collection = collection

        # once the object has been saved, we can request a subscription to its changes (this will be automatic for in the future)
        @when 'id', (id) =>
            @collection.subscribechanges { id: id }, @remoteChangeReceive.bind(@)
            @on 'change', @remoteChangePropagade.bind(@)

        # if we haven't been saved yet, we want to flush all our attributes when flush is called..
        if @get 'id' then @changes = {} else @changes = helpers.hashmap(@attributes, -> true)

    # I need a permissions implementation here..
    remoteChangeReceive: (change) ->
        switch change.action
            when 'update' then @set change.update, { silent: true }

    # I need to find nested models here and replace them with their ids
    remoteChangePropagade: (model,data) ->
        change = model.changedAttributes()
        delete change.id
        _.extend @changes, helpers.hashmap(change, -> true)
        # flush call would go here if it were throtteled properly and if autoflush is enabled

    # I need a permissions implementation here..
    remoteCallPropagade: (name,args,callback) ->
        @collection.fcall name,args,{ id: @id }, callback         
        
    remoteCallReceive: (name,args,callback) ->
        @[name].apply @, args.concat(callback)

    export: (realm,attrs) ->
        return helpers.hashfilter attrs, (value,property) => @attributes[property]

    exportchanges: (realm) ->
        ret = @export(realm,@changes)
        @changes = {}
        return ret

    update: (data) -> @set(data)
    
    # simplified for now, will reintroduce when done with model syncing
    # throttle decorator makes sure that we can apply bunch of changes in a series to an object, but the system requests a sync only once.
    #flush: decorate( decorators.MakeDecorator_Throttle({ throttletime: 1 }), (callback) -> @flushnow(callback) )
    flush: (callback) -> @flushnow(callback)

    flushnow: (callback) ->
        changes = @exportchanges('store')
        if helpers.isEmpty(changes) then helpers.cbc(callback)
        if not id = @get 'id' then @collection.create changes, (err,id) => @set 'id', id; helpers.cbc callback, err, id
        else @collection.update {id: id}, changes, callback

    del: (callback) ->
        console.log('triggering del')
        @trigger 'del', @
        if id = @get 'id' then @collection.remove {id: id}, callback else callback()
    
