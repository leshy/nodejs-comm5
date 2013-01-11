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

    asyncDepthfirst: (changef, callback, clone=false, target=@attributes) ->

        if target.constructor is Object or target.constructor is Array
            if clone then target = _.clone target
            bucket = new helpers.parallelBucket()
            
            for key of target
                cb = bucket.cb()
                result = (err,data) -> target[key] = data; cb(err,data)
                @asyncDepthfirst changef, result, clone, target[key]
                
            bucket.done (err,data) -> callback(err,target)
        else
            helpers.forceCallback changef, target, callback 
        
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
    exportreferences: (data,callback) ->
        # finds a reference to remotemodel, and converts it to saveable reference in a form of a small json that points to the correct collection and id
        _matchf = (value,callback) ->
            if value instanceof RemoteModel
                # has a child model been flushed?
                if id = value.get('id') then callback undefined, { _r: id, _c: value.collection.name() }
                else # if not, flush it, and then create a proper reference
                    value.flush (err,id) ->
                    if err then callback(err,id)
                    else callback undefined, { _r: id, _c: value.collection.name() }
                return undefined
            else value # we can also return a value, and not call the callback, as this function gets wrapped into helpers.forceCallback

        @asyncDepthfirst _matchf, callback, true, data

    importreferences: (data,callback) ->
        _import = (reference) -> true # instantiate an unresolved reference, or the propper model, with an unresolved state.
        
        refcheck = v _r: "String", _c: "String"

        _matchf = (value,callback) ->
            refcheck.feed value, (err,data) ->
            if err then callback undefined, value
            else callback undefined, "MATCHED"
            return
                
        @asyncDepthfirst _matchf, callback, false, data
        
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

        @exportreferences changes, (err, changes) =>
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
    
