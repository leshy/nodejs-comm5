_ = require 'underscore'
modelsync = require '../modelsync'

_.map modelsync, (f,name) -> exports[name] = f

