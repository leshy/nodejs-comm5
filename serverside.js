(function() {
  var mount, _;
  _ = require('underscore');
  mount = function(obj) {
    return _.map(obj, function(f, name) {
      return exports[name] = f;
    });
  };
  mount(require('./core'));
  mount(require('./modelsync/serverside'));
  mount(require('./transports/serverside/http'));
  mount(require('./transports/serverside/websocket'));
  mount(require('./transports/serverside/nssocket'));
}).call(this);
