_ = require 'underscore'

mount = (obj) -> _.map obj, (f,name) -> exports[name] = f

mount require './core'
mount require './modelsync/serverside'
mount require './transports/serverside/http'
mount require './transports/serverside/websocket'
mount require './transports/serverside/nssocket'
