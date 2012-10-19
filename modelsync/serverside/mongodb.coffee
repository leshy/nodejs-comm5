BSON = require('mongodb').BSONPure
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
collections = require '../collections'


MongoCollection = exports.MongoCollection = collections.CollectionAbsLayer.extend4000
    validator: v( db: 'instance', collection: v().or('string','instance') )
    
    initialize: ->
        @collection = @get('collection')
        if @collection.constructor is String then @get('db').collection @collection, (err,collection) => @set { collection: @collection = collection }
        
    create: (entry,callback) -> 
        @collection.insert(entry,callback)

