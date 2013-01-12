Backbone = require 'backbone4000'
_ = require 'underscore'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
decorators = require 'decorators'; decorate = decorators.decorate;

# knows about its collection, knows how to store/create itself and defines the permissions
#
#
# it logs changes of its attributes (localCallPropagade) 
# and when flush() is called it will call its collection and provide it with its changed data (update or create request depending if the model already exists in the collection)
#
# it will also subscribe to changes to its id on its collection, so it will update itself (remoteChangeReceive) with remote data
#
# it also has localCallPropagade and remoteCallReceive for remote function calling
# 
RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000
    validator: v { collection: 'instance' }

    depthfirst: (callback,target=@attributes) ->
        if target.constructor is Object or target.constructor is Array
            target = _.clone target
            for key of target
                target[key] = @depthfirst callback, target[key]
            target
        else if response = callback(target) then response else target

    asyncDepthfirst: (changef, callback, clone=false, all=false, target=@attributes) ->
        # call changef on the target, return results
        _check = (target,callback) -> helpers.forceCallback changef, target, callback
        # recursively search through an iterable target
        _digtarget = (target,callback) =>
            bucket = new helpers.parallelBucket()
            
            for key of target
                cb = bucket.cb()
                result = (err,data) -> target[key] = data; cb(err,data)
                @asyncDepthfirst changef, result, clone, all, target[key]
                
            bucket.done (err,data) -> callback(err,target)
    
        if target.constructor is Object or target.constructor is Array
            if clone then target = _.clone target
            if all then _check target, (err,target) ->
                if target.constructor is Object or target.constructor is Array then _digtarget(target,callback) else callback(undefined,target)
            else _digtarget(target,callback)
        else
            _check target, callback

    reference: (id=@get 'id') ->  { _r: id, _c: @collection.name() }
    
    initialize: ->
        # this is temporary, permission system will make sure that this is never exported
        @when 'collection', (collection) =>
            @unset 'collection'
            @collection = collection

        # once the object has been saved, we can request a subscription to its changes (this will be automatic for in the future)
        @when 'id', (id) =>
            @collection.subscribechanges { id: id }, @remoteChangeReceive.bind(@)
            @on 'change', @localChangePropagade.bind(@)

        @importReferences @attributes, (err,data) => @attributes = data

        # if we haven't been saved yet, we want to flush all our attributes when flush is called..
        if @get 'id' then @changes = {} else @changes = helpers.hashmap(@attributes, -> true)

    # I need a permissions implementation here..
    remoteChangeReceive: (change) ->
        switch change.action
            when 'update' then @set change.update, { silent: true }

    # I need to find nested models here and replace them with their ids
    localChangePropagade: (model,data) ->
        change = model.changedAttributes()
        delete change.id
        _.extend @changes, helpers.hashmap(change, -> true)
        # flush call would go here if it were throtteled properly and if autoflush is enabled

    # I need a permissions implementation here..
    localCallPropagade: (name,args,callback) ->
        @collection.fcall name,args,{ id: @id }, callback         
        
    remoteCallReceive: (name,args,callback) ->
        @[name].apply @, args.concat(callback)

    export: (realm,attrs) ->
        return helpers.hashfilter attrs, (value,property) => @attributes[property]

    # looks for references to remote models and replaces them with object ids
    # what do we do if a reference object is not flushed? propagade flush call for now
    exportReferences: (data,callback) ->
        # finds a reference to remotemodel, and converts it to saveable reference in a form of a small json that points to the correct collection and id
        _matchf = (value,callback) ->
            if value instanceof RemoteModel
                # has a child model been flushed?
                if id = value.get('id') then callback undefined, value.reference(id)
                else # if not, flush it, and then create a proper reference
                    value.flush (err,id) ->
                    if err then callback(err,id)
                    else callback undefined, value.reference(id)
                return undefined
            else value # we can also return a value, and not call the callback, as this function gets wrapped into helpers.forceCallback

        @asyncDepthfirst _matchf, callback, true, false, data

    importReferences: (data,callback) ->
        _import = (reference) -> true # instantiate an unresolved reference, or the propper model, with an unresolved state.
        
        refcheck = v { _r: "String", _c: "String" }
        
        _resolve_reference = (ref) =>
            if not targetcollection = @collection.getcollection(ref._c) then throw 'unknown collection "' + ref._c + '"'
            else targetcollection.unresolved(ref._r)

        _matchf = (value,callback) ->
            refcheck.feed value, (err,data) ->
                if err then callback undefined, value
                else callback undefined, _resolve_reference(value)
            return undefined
                
        @asyncDepthfirst _matchf, callback, false, true, data
        
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

        @exportReferences changes, (err, changes) =>
            if helpers.isEmpty(changes) then helpers.cbc(callback)
            if not id = @get 'id' then @collection.create changes, (err,id) => @set 'id', id; helpers.cbc callback, err, id
            else @collection.update {id: id}, changes, callback

    # requests its data from a collection
    fetch: (callback) ->
        true
        
    del: (callback) ->
        @trigger 'del', @
        if id = @get 'id' then @collection.remove {id: id}, callback else callback()
    
