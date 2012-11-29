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

        # specific field search request
        @subscribe { http: 'GET', url: v().regex(new RegExp(root + "(.*)\/(.*)\/(.*)", "g")) }, (msg,reply,next,transmit) =>
            collection = msg.url[1]
            attribute = msg.url[2]
            searchstring = msg.url[3]

            find = {}
            find[attribute] =  { '$regex' : '.*' + searchstring + '.*' }
            console.log(find)

            res = @send collection: collection, find: find, limits: {}
            res.read (msg) ->
                if (msg) then reply.write msg.data else reply.end()


        # general search request
        @subscribe { http: 'GET', url: v().regex(new RegExp(root + "(.*)\/(.*)", "g")) }, (msg,reply,next,transmit) =>
            collection = msg.url[1]
            searchstring = msg.url[2]
            res = @send collection: collection, find: { title: { '$regex' : '.*' + searchstring + '.*' } }, limits: {}
            
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
