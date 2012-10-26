(function() {
  var mount, _;
  _ = require('underscore');
  mount = function(obj) {
    return _.map(obj, function(f, name) {
      return exports[name] = f;
    });
  };
  mount(require('./modelsync'));
  mount(require('./transports/clientside/websocket'));
}).call(this);
