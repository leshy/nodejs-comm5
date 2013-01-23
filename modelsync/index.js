(function() {
  var collections, remotemodel;
  collections = require('./collections');
  remotemodel = require('./remotemodel');
  exports.RemoteModel = remotemodel.RemoteModel;
  exports.Permission = remotemodel.Permission;
  exports.definePermissions = remotemodel.definePermissions;
  exports.RemoteCollection = collections.RemoteCollection;
}).call(this);
