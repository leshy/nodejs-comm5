(function() {
  var collections, remotemodel;
  collections = require('./collections');
  remotemodel = require('./remotemodel');
  exports.RemoteModel = remotemodel.RemoteModel;
  exports.RemoteCollection = collections.RemoteCollection;
}).call(this);
