Backbone = require 'backbone4000'
_ = require 'underscore'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
decorators = require 'decorators'; decorate = decorators.decorate;


# knows about its collection, knows how to store/create itself and defines the permissions
RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000
    validator: v { collection: 'instance' }

    depthfirst: (callback,target=@attributes) ->
        if target.constructor is Object or target.constructor is Array
            target = _.clone target
            for key of target
                target[key] = @depthfirst callback, target[key]
            target
        else if response = callback(target) then response else target
            
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

    # looks for references to remote models and replaces them with object ids
    # what do we do if a reference object is not flushed? propagade flush call for now
    exportreferences: () ->
        _export = (model) -> _r: model.get('id'), _c: model.collection.name()
        @depthfirst (val) -> if val instanceof RemoteModel then _export(val) else val

    importreferences: (attributes) ->
        _import = (reference) -> true
        
        refcheck = v _r: "String", _c: "String"
        
        @depthfirst (val) ->
            refcheck.feed val, (err,data) ->
                if not err then return 
            # fuck, I need async depthfirst. booooring

    # apply permissions per realm
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

        changes = @exportreferences(changes)
        
        if helpers.isEmpty(changes) then helpers.cbc(callback)
        if not id = @get 'id' then @collection.create changes, (err,id) => @set 'id', id; helpers.cbc callback, err, id
        else @collection.update {id: id}, changes, callback

    # requests its data from a collection
    fetch: (callback) ->
        true

    del: (callback) ->
        #console.log('triggering del')
        @trigger 'del', @
        if id = @get 'id' then @collection.remove {id: id}, callback else callback()
    
