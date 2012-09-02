var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var async = require('async')
var helpers = require('helpers')

var v = require('validator'); var Validator = v.Validator; var Select = v.Select

var Msg = exports.Msg = require('./msg').Msg
var MsgNode = exports.MsgNode = require('./msgnode').MsgNode


// backbone model that uses validator on its own attributes (for initialization)
// feed call in this case should BLOCK. at least on the level of this object's init.. 
// we don't want other subclassed initialize functions to be called until verification is complete
var ValidatedObject = Backbone.Model.extend4000({
    initialize: function () {
        var validator 
        if (validator = this.get('validator')) {
            Validator(validator).feed(this.attributes,function (err,data) { if (err) { throw err } })
        }
    }
})


// sets realm for a message to be this.attributes.realm, 
// passes it to other potential local subscribers and broadcasts message to other nodes connected to this node
var BorderMan = exports.BorderMan = Backbone.Model.extend4000(
    MsgNode,
    ValidatedObject,
    {        
        validator: Validator({ realm: "String" }),
        initialize: function () {
            var self = this
            self.subscribe({ realm: Validator().Set(self.get('realm')) },function (msg,reply,next,pass) {
                pass()
                next()
            })
        }
    })

