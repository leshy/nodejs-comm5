var _ = require('underscore')
var Backbone = require('backbone4000');
var decorators = require('decorators'); var decorate = decorators.decorate;
var helpers = require('helpers')

var v = require('validator'); var Validator = v.Validator; var Select = v.Select

var Msg = exports.Msg = require('./msg').Msg
var MsgNode = exports.MsgNode = require('./msgnode').MsgNode



// sets realm for a message to be this.attributes.realm, 
// passes it to other potential local subscribers and broadcasts message to other nodes connected to this node
var BorderMan = exports.BorderMan = Backbone.Model.extend4000(
    MsgNode,
    v.ValidatedModel,
    {        
        validator: Validator({ realm: "String" }),

        initialize: function () {
            var self = this
            self.subscribe({ realm: Validator().Set(self.get('realm')) },function (msg,reply,next,transmit) {
                transmit(); reply.end()
            })
        }
    })



