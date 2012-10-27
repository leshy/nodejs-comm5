_ = require 'underscore'
mount = (obj) -> _.map obj, (f,name) -> exports[name] = f

mount require './mongodb' 
mount require '../index'

