_ = require('underscore')
Backbone = require('backbone4000');
decorators = require('decorators'); decorate = decorators.decorate;
helpers = require('helpers')

Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select

core = require('../../core/'); MsgNode = core.MsgNode; Msg = core.Msg

# rest translates Http request messages to backbone collection queries
Rest = exports.Rest = Backbone.Model.extend4000 MsgNode, Validator.ValidatedModel,
    validator: v(root: v().Default("/"))
    initialize: ->
        root = @get 'root'

        # search request
        @subscribe { http: 'GET', url: v().regex(new RegExp(root + "(.*)\/(.*)", "g")) }, (msg,reply,next,transmit) =>
            collection = msg.url[1]
            search = msg.url[2]
            
            res = @send collection: collection, find: { title: { '$regex' : '.*' + search + '.*' } }, limits: {}
            
            res.read (msg) ->
                if (msg) then reply.write msg.data else reply.end()

        # list request
        @subscribe { http: 'GET', url: v().regex(new RegExp(root + "(.*)", "g")) }, (msg,reply,next,transmit) =>
            collection = msg.url[1]

            res = @send collection: collection, find: {}, limits: {}
            res.read (msg) ->
                if (msg) then reply.write msg.data else reply.end()

        # update request
        @subscribe { http: 'POST', url: v().regex(new RegExp(root + "(.*)\/(.*)", "g")) }, (msg,reply,next,transmit) =>
            collection = msg.url[1]
            id = msg.url[2]
            reply.write({ collection: name, book: id , update: 'unknwon' })
            reply.end()
        