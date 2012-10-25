(function() {
  var modelsync, _;
  _ = require('underscore');
  modelsync = require('../modelsync');
  _.map(modelsync, function(f, name) {
    return exports[name] = f;
  });
}).call(this);
