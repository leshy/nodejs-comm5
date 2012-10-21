Backbone = require 'backbone4000'
_ = require 'underscore'
decorators = require 'decorators'
decorate = decorators.decorate;
async = require 'async'
helpers = require 'helpers'
Validator = require 'validator2-extras'; v = Validator.v; Select = Validator.Select


var RemoteModel = exports.RemoteModel = Backbone.Model.extend4000()