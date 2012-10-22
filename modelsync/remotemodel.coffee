`Backbone = require 'backbone4000'
_ = require 'underscore'
decorators = require 'decorators'
decorate = decorators.decorate;
async = require 'async'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select


var RemoteModel = exports.RemoteModel = Validator.ValidatedModel.extend4000
    validator: v( collection: 'instance' )
    
    initialize: ->
        @collection = @get 'collection'
        @when 'id' => @hook()
        
       
    hook: -> @collection.subscribe({ id: @id })
    