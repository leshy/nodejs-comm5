_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
core = require '../core/'; MsgNode = core.MsgNode; Msg = core.Msg

WebsocketWrapper = exports.WebsocketWrapper = core.ConnectionMan.extend4000
    validator: v { realm: "string", socket: "instance" }

    initialize: -> @get('socket').on 'disconnect', => @trigger 'disconnect'

    tx: (msgstring) ->
        try
            JSON.stringify(msgstring)
        catch error
            console.log "CAN'T STRINGIFY".red, msgstring
            
        @get('socket').emit 'msg', msgstring
    rx: (callback) -> @get('socket').on 'msg', callback

