BSON = require('mongodb').BSONPure
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
collections = require '../collections'
Backbone = require 'backbone4000'
_ = require 'underscore'

MongoCollection = exports.MongoCollection = Backbone.Model.extend4000
    validator: v( db: 'instance', collection: v().or('string','instance') )
    
    initialize: ->
        @collection = @get('collection')
        if @collection.constructor is String then @get('db').collection @collection, (err,collection) => @set { collection: @collection = collection }
        if not @get 'name' then @set { name: @collection.collectionName };

    create: (entry,callback) ->
        entry = _.extend({}, entry) # mongodb api will automatically append _.id to this dict, I want to avoid this..
        @collection.insert(entry,(err,data) ->
            if (data?[0]._id)
                data = String(data[0]._id);
            callback err, data)
        
    # replaces a potential string id with BSON.ObjectID
    patternIn: (pattern) ->
        pattern = _.extend {},pattern
        if pattern.id? then pattern._id = pattern.id; delete pattern.id
        if pattern._id?.constructor is String then pattern._id = new BSON.ObjectID(pattern._id)
        pattern

    patternOut: (pattern) ->
        if not pattern? then return pattern
        pattern = _.extend {},pattern
        if pattern._id? then pattern.id = String(pattern._id); delete pattern._id
        pattern
            
    find: (pattern,limits,callback) ->
        @collection.find @patternIn(pattern), limits, (err,cursor) => cursor.each (err,entry) =>
            callback @patternOut(entry)

    findOne: (pattern,callback) ->
        @collection.findOne @patternIn(pattern), (err,entry) =>
            callback @patternOut(entry)

    remove: (pattern,callback) ->
        @collection.remove @patternIn(pattern), callback

    update: (pattern,update,callback) ->
        @collection.update @patternIn(pattern), { '$set': update }, callback

MongoCollectionNode = exports.MongoCollectionNode = MongoCollection.extend4000 collections.ModelMixin, collections.SubscriptionMixin, collections.ReferenceMixin, collections.CollectionExposer

