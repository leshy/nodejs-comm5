_ = require 'underscore'
wait = (time,f) -> setTimeout(f,time)
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select


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
        @c.create {bla: 3}, (err,data) => if data? and not err?
            @created = data;
            @c.find {bla: 3}, {}, (entry) =>
                if String(entry?.id) is @created then found = true
                if not entry? then test.equals(found,true); test.done()
        else test.fail()

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

    find: (test) ->
        response = @c.msg ({ collection: 'test', find: { bla: 3 }})
        response.read (msg) ->
            if not msg then test.done()

    update_raw: (test) ->
        response = @c.msg ({ collection: 'test', update: { bla: 3 }, data: { bla: 4} , raw: true })
        response.read (msg) ->
            if not msg then test.done()

    remove_raw: (test) ->
        @c.msg ({ collection: 'test', remove: { bla: 4 }, raw: true })
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
        @c.create {bla: 3}, (err,data) => if data? and not err?
            @created = data;
            @c.find {bla: 3}, {}, (entry) =>
                if String(entry?.id) is @created then found = true
                if not entry? then test.equals(found,true); test.done()
        else test.fail()

    remove: (test) ->
        #@c.create {bla: 3}, (err,id) => if id? and err? then test.fail("didn't get anything") else
        @c.find { bla:3 }, {}, (entry) =>
            if (entry) then @c.remove { id: entry.id }, (err,data) -> test.equals(data,1); test.done();

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
    

###
exports.ModelMixin =
    defineModel: (test) ->
        remotemodel = require './remotemodel'
        collections = require './collections'
        mixin = new collections.ModelMixin()
        newmodel = mixin.defineModel('bla1',{ initialize: -> true })

        instance = new newmodel()
        test.equals(instance.get('type'),'bla1')
        test.done()


    findModels: (test) ->
        remotemodel = require './remotemodel'
        collections = require './collections'
        mixin = new collections.ModelMixin()
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
###

exports.AutoModelSync =
    setUp: (callback) ->
        @mongoC = require './serverside/mongodb'
        @collections = require './collections'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb',new @mongo.Server('localhost',27017), {safe: true });
        
        @c = new @mongoC.MongoCollectionNode { db: @db, collection: 'test' }
        
        @db.open callback
        
    tearDown: (callback) ->
        @db.close()
        callback()

    remoteModelUpdates: (test) ->
        newmodel1 = @c.defineModel 'bla2',{ hi: -> 'bla2' }
        instance1 = new newmodel1 { something: 999, bla: 2 }
        instance1.flush (err,id) =>
            @c.findModels {id: id },{},(instance2) =>
                if instance2
                    instance1.set { bla: 3 }
                    instance1.flush (err,id) =>
                        test.equals instance2.get('bla'), 3
                        instance1.del(test.done)

                        
exports.References =
    setUp: (callback) ->
        @remotemodel = require './remotemodel'
        @mongoC = require './serverside/mongodb'
        @collections = require './collections'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb',new @mongo.Server('localhost',27017), {safe: true });
        
        @c1 = realcollection = new @mongoC.MongoCollectionNode { db: @db, collection: 'test' }
        @c2 = realcollection = new @mongoC.MongoCollectionNode { db: @db, collection: 'test2' }
        
        @db.open callback

    tearDown: (callback) ->
        @db.close()
        callback()
    
    depthFirst: (test) ->
        newmodel1 = @c1.defineModel 'bla1', { hi: 3 }

        x = new newmodel1
            property1: 3
            something: { lala: 3, bla: 75, ff: 'lfla' }
            ar: [ 1,2,3,4,5 ]


        test.deepEqual { property1: 'replaced', something: { lala: 'replaced', bla: 75, ff: 'lfla' }, ar: [ 1, 2, 'replaced', 4, 5 ], _t: 'bla1' }, x.depthfirst (val) -> if val is 3 then 'replaced' else val

        test.done()


    asyncDepthFirst_noasync: (test) ->
        newmodel1 = @c1.defineModel 'bla1', { hi: 3 }

        x = new newmodel1
            property1: 3
            something: { lala: 3, bla: 75, ff: 'lfla' }
            ar: [ 1,2,3,4,5 ]
            
        x.asyncDepthfirst ((val,callback) -> if val is 3 then 'replaced' else val),
            (err,data) ->
                test.deepEqual { property1: 'replaced', something: { lala: 'replaced', bla: 75, ff: 'lfla' }, ar: [ 1, 2, 'replaced', 4, 5 ], _t: 'bla1' }, data
                test.done()


    asyncDepthFirst_async_wat: (test) ->
        newmodel1 = @c1.defineModel 'bla1', { hi: 3 }

        x = new newmodel1
            property1: 4

        f = (val,callback) ->
            if val is 3 then callback(undefined,'replaced') else callback(undefined,val)
                
        cb = (err,data) ->
                test.deepEqual { property1: 4, _t: 'bla1' }, data
                test.done()


        x.asyncDepthfirst f, cb, true, false



    asyncDepthFirst_async: (test) ->
        newmodel1 = @c1.defineModel 'bla1', { hi: 3 }

        x = new newmodel1
            property1: 3
            something: { lala: 3, bla: 75, ff: 'lfla' }
            ar: [ 1,2,3,4,5 ]

        f = (val,callback) ->
            if val is 3 then callback(undefined,'replaced') else callback(undefined,val)

        x.asyncDepthfirst f,
            (err,data) ->
                test.deepEqual { property1: 'replaced', something: { lala: 'replaced', bla: 75, ff: 'lfla' }, ar: [ 1, 2, 'replaced', 4, 5 ], _t: 'bla1' }, data
                test.done()


    exportReferences: (test) ->
        parentmodel = @c1.defineModel 'type1', { hi: 3 }

        childmodel1 = @c1.defineModel 'type1', { childmodel: 1 }
        childmodel2 = @c2.defineModel 'type2', { childmodel: 2 }

        child1 = new childmodel1 { some_value: 5 }
        child2 = new childmodel2 { some_value: 6 }

        child1.flush ->
            child2.flush ->
                
                parent = new parentmodel { testdict: { bla: child1, bla2: 3 }, child2: child2, ar: [ child1, 3 ,4, 'ggg' ] }
                parent.exportReferences parent.attributes, (err,exported) -> 

                    expected =
                        testdict: { bla: { "_r": child1.get('id'), "_c": 'test' }, bla2: 3 }
                        child2: { "_r": child2.get('id'), "_c": 'test2' }
                        ar: [ { "_r": child1.get('id'), "_c": 'test' }, 3, 4, 'ggg' ],
                        _t: 'type1'

                    test.deepEqual exported, expected

                    child1.del ->
                        child2.del ->
                            test.done()

    importReferences: (test) ->
        parentmodel = @c1.defineModel 'type1', { hi: 3 }

        childmodel1 = @c1.defineModel 'type1', { childmodel: 1 }
        childmodel2 = @c2.defineModel 'type2', { childmodel: 2 }

        child1 = new childmodel1 { some_value: 5 }
        child2 = new childmodel2 { some_value: 6 }

        child1.flush =>
            child2.flush =>                
                parent = new parentmodel( { testdict: { bla: child1, bla2: 3 }, child2: child2, ar: [ child1, 3 ,4, 'ggg' ] })
                parent.flush (err,id) =>
                    @c1.findModel { id: id }, (err,model) ->
                        model.get('child2').resolve (myclass) ->
                            test.equals model.get('child2').get('some_value'), 6
                            parent.del ->
                                child1.del ->
                                    child2.del -> 
                                        test.done()



exports.Permissions =
    setUp: (callback) ->
        @remotemodel = require './remotemodel'
        @mongoC = require './serverside/mongodb'
        @collections = require './collections'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb',new @mongo.Server('localhost',27017), {safe: true });
        
        @c = realcollection = new @mongoC.MongoCollectionNode { db: @db, collection: 'test' }
        
        @db.open callback

    tearDown: (callback) ->
        @db.close()
        callback()


    getPermission: (test) ->

        model = @c.defineModel 'bla',
            permissions: { xxx: [
                new @remotemodel.Permission( v: 'bobby', matchRealm: v(user: 'bobby'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value ) )
                new @remotemodel.Permission( v: 'bob', matchRealm: v(user: 'bob'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value ) )
                new @remotemodel.Permission( v: 'bob2', matchRealm: v(user: 'bob'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value  ) )
            ]}
        
        x = new model()
        realm =  { user: 'bob'}
        attribute = 'xxx'
        x.getPermission attribute, realm, (err,permission) ->
            test.equals permission.get('v'), 'bob'
            permission.chew "LALA", { realm: realm, attribute: attribute }, (err,data) ->
                test.equals data, 'BLAbobLALA'
                test.done()

    applyPermission: (test) ->
        model = @c.defineModel 'bla',
            permissions: { xxx: [
                new @remotemodel.Permission( v: 'bobby', matchRealm: v(user: 'bobby'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value ) )
                new @remotemodel.Permission( v: 'bob', matchRealm: v(user: 'bob'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value ) )
                new @remotemodel.Permission( v: 'bob2', matchRealm: v(user: 'bob'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value  ) )
            ]}
        
        x = new model()
        realm =  { user: 'bob'}
        attribute = 'xxx'
        x.applyPermission attribute,'LALA',realm, (err,data) ->
            test.equals data, 'BLAbobLALA'
            test.done()


    applyPermissions: (test) -> 
        model = @c.defineModel 'bla',
            permissions: {
                xxx: [
                    new @remotemodel.Permission( v: 'bobby', match: v(user: 'bobby'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value ) )
                    new @remotemodel.Permission( v: 'bob', match: v(user: 'bob'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value ) )
                    new @remotemodel.Permission( v: 'bob2', match: v(user: 'bob'), chew: (value,data,callback) -> ( callback undefined, "BLA" + data.realm.user + value  ) )
                ],
                
                yyy: [
                    new @remotemodel.Permission( match: v(user: 'bob'), chew: (value,data,callback) -> ( callback undefined, "yyy" + data.realm.user + "NOBLA" ) )
                    new @remotemodel.Permission( match: v(user: 'bob', bla: true), chew: (value,data,callback) -> ( callback undefined, "yyy" + data.realm.user + data.realm.bla ) )
                ]
            }

            
        x = new model()
        realm = { user: 'bob', bla: 3 }
        data = { xxx: "set_to_something", yyy: "set_to_something_else" }

        x.applyPermissions { xxx: "set_to_something", yyy: "set_to_something_else" }, realm, (err,data) ->
            test.equal err, undefined
            test.deepEqual data, { xxx: 'BLAbobset_to_something', yyy: 'yyybobNOBLA' }

            x.applyPermissions { xxx: "k", yyy: "set_to_something_else" }, { user: 'bob' }, (err,data) ->
                test.equal err, undefined
                test.deepEqual data, { xxx: 'BLAbobk', yyy: 'yyybobNOBLA' }

                x.applyPermissions { xxx: "k", yyy: "set_to_something_else", zzz: "fail?" }, { user: 'bob' }, (err,data) ->
                    test.equal err, "permission denied for attribute zzz"
                    test.equal data, undefined
                    x.applyPermissions { xxx: "k", yyy: "set_to_something_else", zzz: "fail?", bbb: "fail2!" }, { user: 'bob' }, (err,data) ->
                        #console.log err,data
                        # it will return only zzz as I'm using async.parallel.. don't care to fix atm.
                        test.done()



exports.EverythingTogether =
    setUp: (callback) ->
        @mongoC = require './serverside/mongodb'
        @collections = require './collections'
        @mongo = require 'mongodb'
        @db = new @mongo.Db('testdb',new @mongo.Server('localhost',27017), {safe: true });
        
        @realcollection = realcollection = new @mongoC.MongoCollectionNode { db: @db, collection: 'test' }
        @c = new @collections.RemoteCollection { db: @db, name: 'test' }

        realcollection.connect @c
        
        @db.open callback
        
    tearDown: (callback) ->
        @db.close()
        callback()

    defineModel: (test) ->
        newmodel1 = @c.defineModel 'bla1',{ hi: -> 'bla1' }
        newmodel2 = @c.defineModel 'bla2',{ hi: -> 'bla2' }
        
        test.equals @c.resolveModel({ _t: 'bla2' }), newmodel2
        test.done()


    call: (test) ->
        clientsideModel = @c.defineModel 'bla1',
            hi: (args...,callback) -> @localCallPropagade 'hi', args, callback

        serversideModel = @realcollection.defineModel 'bla1',
            hi: (n,callback) -> callback(undefined, n + 2)

        instance1 = new clientsideModel { something: 666 }

        instance1.flush =>
            test.equals Boolean(instance1.get 'id'), true

            instance1.hi 3, (err,data) ->
                test.equals err, undefined
                test.equals data, 5
                instance1.del(test.done)
                

    findOne: (test) ->
        newmodel1 = @c.defineModel 'findonetest',{ hi: -> 'bla1' }

        instance1 = new newmodel1 { blabla: 3, f: 5 }
        instance2 = new newmodel1 { blabla: 3, f: 8}

        instance1.flush =>
            instance2.flush =>

                test.equals Boolean(instance1.get 'id'), true, "instance1 didn't get an id"
                test.equals Boolean(instance2.get 'id'), true, "instance2 didn't get an id"

                test.notEqual instance1.get 'id', instance2.get 'id'

                @c.findModel { id: instance1.get 'id' }, (err, model) =>
                    test.equals Boolean(model), true, "didn't get instance1 model"

                    found = false
                    
                    @c.findModel { blabla: 3 }, (err, model) =>
                        test.equals Boolean(model), true, "didn't get findOne model"
                        
                        if found then test.fail 'findmodel returned two results'
                        found = true
                        
                        @c.findModel { something_nonexistant: 'nonexistant' }, (nonexistant) =>
                            test.equals nonexistant, undefined
                            instance1.del => instance2.del => test.done()


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
                        test.deepEqual _.omit(instance2.attributes, 'id'), _.omit(instance1.attributes, 'id')
                        test.deepEqual _.omit(instance2.attributes, 'id'), {_t: 'bla1', everythingtogether: 666, somethingelse: 667 }
                        test.equals instance2.get('id').constructor, String
                        
                        id = instance2.get 'id'
                        
                        instance2.del =>                 
                            @c.findModels { id: id }, {}, (model) =>
                                if (model) then test.fail() else false
 