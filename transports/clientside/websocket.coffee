
_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select
core = require '../../core/'; MsgNode = core.MsgNode; Msg = core.Msg

io = require 'socket.io-browserify'
WebsocketWrapper = require('../websocket').WebsocketWrapper

WebsocketClient = exports.WebsocketClient = Backbone.Model.extend4000 MsgNode, Validator.ValidatedModel,
    validator: v { realm: 'string' }
    
    initialize: ->
        @pass()
            
    connect: (host,callback) ->
        socket = io.connect host
        client = new WebsocketWrapper { realm: @get('realm'), socket: socket }
        socket.on 'connect', callback 
        @addconnection client

    end: -> @del()


