var Backbone = require('backbone');
var _ = require('underscore');
var decorators = require('decorators');
var decorate = decorators.decorate;
var async = require('async')
var BSON = require('mongodb').BSONPure

var helpers = require('helpers')
var core = exports.MsgNode = require('../core/'); var MsgNode = core.MsgNode; var Msg = core.Msg



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




c.users.findOne({}).done(function (user) {
    
    
})


var remoteObject = Backbone.Model.extend4000({
    initialize: function () {
        self.updates().read(function (msg) {
            _.extend(this.attributes,msg.update)
        })
    }, 

    updates: function () { return this.msg({subscribe: 'update'}) }
    
})
