_ = require 'underscore'

_.extend exports, require './core'
_.extend exports, require './modelsync'
_.extend exports, require './transports/clientside/websocket'