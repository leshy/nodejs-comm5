var Backbone = require('backbone');
var _ = require('underscore');
var decorators = require('decorators');
var decorate = decorators.decorate;
var async = require('async')
var BSON = require('mongodb').BSONPure

var helpers = require('helpers')
var core = require('../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg


var CollectionNode = exports.CollectionExposer = Backbone.Model.extend4000(
    MsgNode,
    v.ValidatedModel,
    { 
        validator: Validator({ name: "String", collection: "Object" })
        initialize: function () {
            
        }
    })


var CollectionAbstractionLayer = exports.CollectionAbstractionLayer = Backbone.Model.extend4000({
    insert: function (data) {},
    update: function (id,data,) {},
    find: function (pattern,limits) {},
    remove: function (pattern) {},
    subscribeModel: function (id,callback) {},
})

var CursorAbstractionLayer = Backbone.Model.extend4000({
    next: function () {},
    each: function () {},
    toArray: function () {}
})

var MemoryJsonCursor = exports.MemoryJsonCursor = CursorAbstractionLayer.extend4000({
    next: function (callback) {
        
    },

    each: function (callback) {
        
    },

    toArray: function (callback) {
        
    }
})


var MemoryJsonCollection = exports.MemoryJson = CollectionAbstractionLayer.extend4000({
    initialize: function () {
        this.data = []
    },

    update: function (pattern,data) {
        var self = this
        _.map(this.data,function (element) {
            if (self._match(element,pattern)) {
                _.extend(element,data)
            }
        })
    },

    insert: function (entry,callback) {
        data.id = helpers.now()
        this.data.push(entry)
        callback(undefined,data.id)
    },
    
    find: function (pattern,limits,callback) {
        return _.filter(this.data,function (element) { return self._match(element,pattern) })
    },

    remove: function (pattern,callback) {
        callback(undefined,true)
    },
    
    _match: function (element,pattern) {
        return true
    }
})


var CollectionExposer = exports.CollectionExposer = MsgNode.extend4000({
    initialize: function () {
        var name = this.get('name')
        self.subscribe({ find: true, collection: name, 

        
        
    }
    
})


var remoteObject = Backbone.Model.extend4000({
    initialize: function () {
        self.updates().read(function (msg) {
            _.extend(this.attributes,msg.update)
        })
    }, 

    updates: function () { return this.msg({subscribe: 'update'}) }
    
})



