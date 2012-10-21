_ = require 'underscore'

exports.mongo =
    setUp: (callback) ->
        @mongoC = require './serverside/mongodb'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb',new @mongo.Server('localhost',27017), {safe: true });
        @db.open callback
        @c = new @mongoC.MongoCollection { db: @db, collection: 'test' }

    tearDown: (callback) ->
        @db.close()
        callback()
    
    create: (test) ->
        @c.create {bla: 3}, (err,data) -> if data? and not err? then @created = data; test.done() else test.fail()
            
    find: (test) ->
        found = false
        @c.create {bla: 3}, (err,data) -> if data? and not err? then @created = data; test.done() else test.fail()
        @c.find {bla:3}, {}, (entry) ->
            if String(entry?._id) is @created then found = true
            if not entry? then test.equals(found,true); test.done()

    remove: (test) ->
        @c.create {bla: 3}, (err,id) => if data? and err? then test.fail() else
            @c.remove {id: id}, (err,data) -> test.equals(data,1); test.done()

    update: (test) ->
        @c.create {bla: 3}, (err,id) => if data? and err? then test.fail() else
            @c.update {id: id}, { bla: 4, blu: 5 }, (err,data) =>
                found = false
                @c.find {id: id}, {}, (data) =>
                    if data and data.bla is 4 and data.blu is 5 then found = true else false
                    if not data? then test.equals(found,true); @c.remove( {id: id}, -> test.done())
                
    tearDown: (callback) ->
        @db.close()
        callback()
    
exports.mongoNode =
    setUp: (callback) ->
        @mongoC = require './serverside/mongodb'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb', new @mongo.Server('localhost',27017), {safe: true });
        @c = new @mongoC.MongoCollectionNode { db: @db, collection: 'test' }
        @db.open callback        
        
    tearDown: (callback) ->
        @db.close()
        callback()
    
    create: (test) ->
        response = @c.msg ({ collection: 'test', create: { bla: 3 }})
        response.read (msg) ->
            if msg then console.log(msg.data) else test.done()


    find: (test) ->
        response = @c.msg ({ collection: 'test', find: { bla: 3 }})
        response.read (msg) ->
            if msg then console.log(msg.data) else test.done()

    update_raw: (test) ->
        response = @c.msg ({ collection: 'test', update: { bla: 3 }, data: { bla: 4} , raw: true })
        response.read (msg) ->
            if msg then console.log(msg.data) else test.done()

    remove_raw: (test) ->
        response = @c.msg ({ collection: 'test', remove: { bla: 3 }, raw: true })
        response.read (msg) ->
            if msg then console.log(msg.data) else test.done()

        
