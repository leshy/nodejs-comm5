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
        @c.find {bla: 3}, {}, (entry) ->
            if String(entry?._id) is @created then found = true
            if not entry? then test.equals(found,true); test.done()

    remove: (test) ->
        @c.create {bla: 3}, (err,id) => if id? and err? then test.fail() else
            @c.remove {id: id}, (err,data) -> test.equals(data,1); test.done()

    update: (test) ->
        @c.create {bla: 3}, (err,id) => if data? and err? then test.fail() else
            @c.update {id: id}, { bla: 4, blu: 5 }, (err,data) =>
                found = false
                @c.find { id: id }, {}, (data) =>
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
            if not msg then test.done()
#            if msg then console.log(msg.data) else test.done()


    find: (test) ->
        response = @c.msg ({ collection: 'test', find: { bla: 3 }})
        response.read (msg) ->
            if not msg then test.done()

    update_raw: (test) ->
        response = @c.msg ({ collection: 'test', update: { bla: 3 }, data: { bla: 4} , raw: true })
        response.read (msg) ->
            if not msg then test.done()

    remove_raw: (test) ->
        response = @c.msg ({ collection: 'test', remove: { bla: 3 }, raw: true })
        response.read (msg) ->
            if not msg then test.done()

        
exports.mongoRemote =
    setUp: (callback) ->
        @mongoC = require './serverside/mongodb'
        @collections = require './collections'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb',new @mongo.Server('localhost',27017), {safe: true });
        
        realcollection = new @mongoC.MongoCollectionNode { db: @db, collection: 'test' }
        @c = new @collections.RemoteCollection { db: @db, name: 'test' }

        realcollection.connect @c
        
        @db.open callback
        
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
        @c.create {bla: 3}, (err,id) => if id? and err? then test.fail("didn't get anything") else
            @c.remove { id: id }, (err,data) -> test.equals(data,1); test.done();

    update: (test) ->
        @c.create {bla: 3}, (err,id) => if id? and err? then test.fail() else
            @c.update {id: id}, { bla: 4, blu: 5 }, (err,data) =>
                found = false
                @c.find {id: id}, {}, (data) =>
                    if data and data.bla is 4 and data.blu is 5 then found = true else false
                    if not data? then test.equals(found,true); @c.remove( {id: id}, -> test.done())

                                
    tearDown: (callback) ->
        @db.close()
        callback()
    


exports.ModelMixin =
    defineModel: (test) ->
        remotemodel = require './remotemodel'
        mixin = new remotemodel.ModelMixin()
        newmodel = mixin.defineModel('bla1',{ initialize: -> true })

        instance = new newmodel()
        test.equals(instance.get('type'),'bla1')
        test.done()


    findModels: (test) ->
        remotemodel = require './remotemodel'
        mixin = new remotemodel.ModelMixin()
        newmodel1 = mixin.defineModel 'bla1',{ hi: -> 'bla1' }
        newmodel2 = mixin.defineModel 'bla2',{ hi: -> 'bla2' }

        mixin.find = (pattern,limits,callback) ->
            callback { type: 'bla1', kkk: 1}
            callback { type: 'bla1', kkk: 2}
            callback { type: 'bla2', kkk: 3}
            callback { type: 'bla1', kkk: 4}
            callback()

        res = []
        mixin.findModels {},{}, (model) ->
            if model?
                res.push([model.get('type'), model.hi()])
            else
                test.deepEqual( [ [ 'bla1', 'bla1' ], [ 'bla1', 'bla1' ], [ 'bla2', 'bla2' ], [ 'bla1', 'bla1' ] ], res)
                test.done()

exports.EverythingTogether =
    setUp: (callback) ->
        @mongoC = require './serverside/mongodb'
        @collections = require './collections'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb',new @mongo.Server('localhost',27017), {safe: true });
        
        realcollection = new @mongoC.MongoCollectionNode { db: @db, collection: 'test' }
        @c = new @collections.RemoteCollection { db: @db, name: 'test' }

        realcollection.connect @c
        
        @db.open callback
        
    tearDown: (callback) ->
        @db.close()
        callback()

    defineModel: (test) ->
        newmodel1 = @c.defineModel 'bla1',{ hi: -> 'bla1' }
        newmodel2 = @c.defineModel 'bla2',{ hi: -> 'bla2' }
        
        test.equals @c.resolveModel({ type: 'bla2' }), newmodel2
        test.done()

    flush: (test) ->
        newmodel1 = @c.defineModel 'bla1',{ hi: -> 'bla1' }
        newmodel2 = @c.defineModel 'bla2',{ hi: -> 'bla2' }

        instance1 = new newmodel1 { everythingtogether: 666 }
        
        instance1.flush =>
            test.equals Boolean(instance1.get 'id'), true
            instance1.set { somethingelse: 667 }
            instance1.flush =>
                found = false
                @c.findModels {somethingelse: 667},{},(instance2) =>
                    
                    if not instance2
                        if found then test.done() else test.fail()
                    else
                        found = true
                        test.equals instance2.get('everythingtogether'), 666
                        test.deepEqual instance2.export('store'), instance1.export('store')
                        test.deepEqual _.omit(instance2.export('store'), 'id'), {type: 'bla1', everythingtogether: 666, somethingelse: 667 }
                        test.equals instance2.get('id').constructor, String
                        
                        id = instance2.get 'id'
                        
                        instance2.remove ->                 
                            @c.findModels { id: id }, (model) =>
                                if (model) then test.fail() else false


