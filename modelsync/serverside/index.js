(function() {
  var _;
  _ = require('underscore');
  _.extend(exports, require('./mongodb'));
  _.extend(exports, require('../index'));
}).call(this);
