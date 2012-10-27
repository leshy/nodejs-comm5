_ = require 'underscore'
mount = (obj) -> _.map obj, (f,name) -> exports[name] = f

mount require './core'
mount require './modelsync'
mount require './transports/clientside/websocket'


