(function() {
  var Select, Validator, v, wait, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  _ = require('underscore');
  wait = function(time, f) {
    return setTimeout(f, time);
  };
  Validator = require('validator2-extras');
  v = Validator.v;
  Select = Validator.Select;
  exports.mongo = {
    setUp: function(callback) {
      this.mongoC = require('./serverside/mongodb');
      this.mongo = require('mongodb');
      this.db = new this.mongo.Db('testdb', new this.mongo.Server('localhost', 27017), {
        safe: true
      });
      this.db.open(callback);
      return this.c = new this.mongoC.MongoCollection({
        db: this.db,
        collection: 'test'
      });
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    },
    create: function(test) {
      return this.c.create({
        bla: 3
      }, function(err, data) {
        if ((data != null) && !(err != null)) {
          this.created = data;
          return test.done();
        } else {
          return test.fail();
        }
      });
    },
    find: function(test) {
      var found;
      found = false;
      return this.c.create({
        bla: 3
      }, __bind(function(err, data) {
        if ((data != null) && !(err != null)) {
          this.created = data;
          return this.c.find({
            bla: 3
          }, {}, __bind(function(entry) {
            if (String(entry != null ? entry.id : void 0) === this.created) {
              found = true;
            }
            if (!(entry != null)) {
              test.equals(found, true);
              return test.done();
            }
          }, this));
        } else {
          return test.fail();
        }
      }, this));
    },
    remove: function(test) {
      return this.c.create({
        bla: 3
      }, __bind(function(err, id) {
        if ((id != null) && (err != null)) {
          return test.fail();
        } else {
          return this.c.remove({
            id: id
          }, function(err, data) {
            test.equals(data, 1);
            return test.done();
          });
        }
      }, this));
    },
    update: function(test) {
      return this.c.create({
        bla: 3
      }, __bind(function(err, id) {
        if ((typeof data !== "undefined" && data !== null) && (err != null)) {
          return test.fail();
        } else {
          return this.c.update({
            id: id
          }, {
            bla: 4,
            blu: 5
          }, __bind(function(err, data) {
            var found;
            found = false;
            return this.c.find({
              id: id
            }, {}, __bind(function(data) {
              if (data && data.bla === 4 && data.blu === 5) {
                found = true;
              } else {
                false;
              }
              if (!(data != null)) {
                test.equals(found, true);
                return this.c.remove({
                  id: id
                }, function() {
                  return test.done();
                });
              }
            }, this));
          }, this));
        }
      }, this));
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    }
  };
  exports.mongoNode = {
    setUp: function(callback) {
      this.mongoC = require('./serverside/mongodb');
      this.mongo = require('mongodb');
      this.db = new this.mongo.Db('testdb', new this.mongo.Server('localhost', 27017), {
        safe: true
      });
      this.c = new this.mongoC.MongoCollectionNode({
        db: this.db,
        collection: 'test'
      });
      return this.db.open(callback);
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    },
    create: function(test) {
      var response;
      response = this.c.msg({
        collection: 'test',
        create: {
          bla: 3
        }
      });
      return response.read(function(msg) {
        if (!msg) {
          return test.done();
        }
      });
    },
    find: function(test) {
      var response;
      response = this.c.msg({
        collection: 'test',
        find: {
          bla: 3
        }
      });
      return response.read(function(msg) {
        if (!msg) {
          return test.done();
        }
      });
    },
    update_raw: function(test) {
      var response;
      response = this.c.msg({
        collection: 'test',
        update: {
          bla: 3
        },
        data: {
          bla: 4
        },
        raw: true
      });
      return response.read(function(msg) {
        if (!msg) {
          return test.done();
        }
      });
    },
    remove_raw: function(test) {
      var response;
      this.c.msg({
        collection: 'test',
        remove: {
          bla: 4
        },
        raw: true
      });
      response = this.c.msg({
        collection: 'test',
        remove: {
          bla: 3
        },
        raw: true
      });
      return response.read(function(msg) {
        if (!msg) {
          return test.done();
        }
      });
    }
  };
  exports.mongoRemote = {
    setUp: function(callback) {
      var realcollection;
      this.mongoC = require('./serverside/mongodb');
      this.collections = require('./collections');
      this.mongo = require('mongodb');
      this.db = new this.mongo.Db('testdb', new this.mongo.Server('localhost', 27017), {
        safe: true
      });
      realcollection = new this.mongoC.MongoCollectionNode({
        db: this.db,
        collection: 'test'
      });
      this.c = new this.collections.RemoteCollection({
        db: this.db,
        name: 'test'
      });
      realcollection.connect(this.c);
      return this.db.open(callback);
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    },
    create: function(test) {
      return this.c.create({
        bla: 3
      }, function(err, data) {
        if ((data != null) && !(err != null)) {
          this.created = data;
          return test.done();
        } else {
          return test.fail();
        }
      });
    },
    find: function(test) {
      var found;
      found = false;
      return this.c.create({
        bla: 3
      }, __bind(function(err, data) {
        if ((data != null) && !(err != null)) {
          this.created = data;
          return this.c.find({
            bla: 3
          }, {}, __bind(function(entry) {
            if (String(entry != null ? entry.id : void 0) === this.created) {
              found = true;
            }
            if (!(entry != null)) {
              test.equals(found, true);
              return test.done();
            }
          }, this));
        } else {
          return test.fail();
        }
      }, this));
    },
    remove: function(test) {
      return this.c.find({
        bla: 3
      }, {}, __bind(function(entry) {
        if (entry) {
          return this.c.remove({
            id: entry.id
          }, function(err, data) {
            test.equals(data, 1);
            return test.done();
          });
        }
      }, this));
    },
    update: function(test) {
      return this.c.create({
        bla: 3
      }, __bind(function(err, id) {
        if ((id != null) && (err != null)) {
          return test.fail();
        } else {
          return this.c.update({
            id: id
          }, {
            bla: 4,
            blu: 5
          }, __bind(function(err, data) {
            var found;
            found = false;
            return this.c.find({
              id: id
            }, {}, __bind(function(data) {
              if (data && data.bla === 4 && data.blu === 5) {
                found = true;
              } else {
                false;
              }
              if (!(data != null)) {
                test.equals(found, true);
                return this.c.remove({
                  id: id
                }, function() {
                  return test.done();
                });
              }
            }, this));
          }, this));
        }
      }, this));
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    }
  };
  /*
  exports.ModelMixin =
      defineModel: (test) ->
          remotemodel = require './remotemodel'
          collections = require './collections'
          mixin = new collections.ModelMixin()
          newmodel = mixin.defineModel('bla1',{ initialize: -> true })
  
          instance = new newmodel()
          test.equals(instance.get('type'),'bla1')
          test.done()
  
  
      findModels: (test) ->
          remotemodel = require './remotemodel'
          collections = require './collections'
          mixin = new collections.ModelMixin()
          newmodel1 = mixin.defineModel 'bla1',{ hi: -> 'bla1' }
          newmodel2 = mixin.defineModel 'bla2',{ hi: -> 'bla2' }
  
          mixin.find = (pattern,limits,callback) ->
              callback { type: 'bla1', kkk: 1}
              callback { type: 'bla1', kkk: 2}
              callback { type: 'bla2', kkk: 3}
              callback { type: 'bla1', kkk: 4}
              callback()
  
          res = []
          mixin.findModels {},{}, (model) ->
              if model?
                  res.push([model.get('type'), model.hi()])
              else
                  test.deepEqual( [ [ 'bla1', 'bla1' ], [ 'bla1', 'bla1' ], [ 'bla2', 'bla2' ], [ 'bla1', 'bla1' ] ], res)
                  test.done()
  */
  exports.AutoModelSync = {
    setUp: function(callback) {
      this.mongoC = require('./serverside/mongodb');
      this.collections = require('./collections');
      this.mongo = require('mongodb');
      this.db = new this.mongo.Db('testdb', new this.mongo.Server('localhost', 27017), {
        safe: true
      });
      this.c = new this.mongoC.MongoCollectionNode({
        db: this.db,
        collection: 'test'
      });
      return this.db.open(callback);
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    },
    remoteModelUpdates: function(test) {
      var instance1, newmodel1;
      newmodel1 = this.c.defineModel('bla2', {
        hi: function() {
          return 'bla2';
        }
      });
      instance1 = new newmodel1({
        something: 999,
        bla: 2
      });
      return instance1.flush(__bind(function(err, id) {
        return this.c.findModels({
          id: id
        }, {}, __bind(function(instance2) {
          if (instance2) {
            instance1.set({
              bla: 3
            });
            return instance1.flush(__bind(function(err, id) {
              test.equals(instance2.get('bla'), 3);
              return instance1.del(test.done);
            }, this));
          }
        }, this));
      }, this));
    }
  };
  exports.References = {
    setUp: function(callback) {
      var realcollection;
      this.remotemodel = require('./remotemodel');
      this.mongoC = require('./serverside/mongodb');
      this.collections = require('./collections');
      this.mongo = require('mongodb');
      this.db = new this.mongo.Db('testdb', new this.mongo.Server('localhost', 27017), {
        safe: true
      });
      this.c1 = realcollection = new this.mongoC.MongoCollectionNode({
        db: this.db,
        collection: 'test'
      });
      this.c2 = realcollection = new this.mongoC.MongoCollectionNode({
        db: this.db,
        collection: 'test2'
      });
      return this.db.open(callback);
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    },
    depthFirst: function(test) {
      var newmodel1, x;
      newmodel1 = this.c1.defineModel('bla1', {
        hi: 3
      });
      x = new newmodel1({
        property1: 3,
        something: {
          lala: 3,
          bla: 75,
          ff: 'lfla'
        },
        ar: [1, 2, 3, 4, 5]
      });
      test.deepEqual({
        property1: 'replaced',
        something: {
          lala: 'replaced',
          bla: 75,
          ff: 'lfla'
        },
        ar: [1, 2, 'replaced', 4, 5],
        _t: 'bla1'
      }, x.depthfirst(function(val) {
        if (val === 3) {
          return 'replaced';
        } else {
          return val;
        }
      }));
      return test.done();
    },
    asyncDepthFirst_noasync: function(test) {
      var newmodel1, x;
      newmodel1 = this.c1.defineModel('bla1', {
        hi: 3
      });
      x = new newmodel1({
        property1: 3,
        something: {
          lala: 3,
          bla: 75,
          ff: 'lfla'
        },
        ar: [1, 2, 3, 4, 5]
      });
      return x.asyncDepthfirst((function(val, callback) {
        if (val === 3) {
          return 'replaced';
        } else {
          return val;
        }
      }), function(err, data) {
        test.deepEqual({
          property1: 'replaced',
          something: {
            lala: 'replaced',
            bla: 75,
            ff: 'lfla'
          },
          ar: [1, 2, 'replaced', 4, 5],
          _t: 'bla1'
        }, data);
        return test.done();
      });
    },
    asyncDepthFirst_async_wat: function(test) {
      var cb, f, newmodel1, x;
      newmodel1 = this.c1.defineModel('bla1', {
        hi: 3
      });
      x = new newmodel1({
        property1: 4
      });
      f = function(val, callback) {
        if (val === 3) {
          return callback(void 0, 'replaced');
        } else {
          return callback(void 0, val);
        }
      };
      cb = function(err, data) {
        test.deepEqual({
          property1: 4,
          _t: 'bla1'
        }, data);
        return test.done();
      };
      return x.asyncDepthfirst(f, cb, true, false);
    },
    asyncDepthFirst_async: function(test) {
      var f, newmodel1, x;
      newmodel1 = this.c1.defineModel('bla1', {
        hi: 3
      });
      x = new newmodel1({
        property1: 3,
        something: {
          lala: 3,
          bla: 75,
          ff: 'lfla'
        },
        ar: [1, 2, 3, 4, 5]
      });
      f = function(val, callback) {
        if (val === 3) {
          return callback(void 0, 'replaced');
        } else {
          return callback(void 0, val);
        }
      };
      return x.asyncDepthfirst(f, function(err, data) {
        test.deepEqual({
          property1: 'replaced',
          something: {
            lala: 'replaced',
            bla: 75,
            ff: 'lfla'
          },
          ar: [1, 2, 'replaced', 4, 5],
          _t: 'bla1'
        }, data);
        return test.done();
      });
    },
    exportReferences: function(test) {
      var child1, child2, childmodel1, childmodel2, parentmodel;
      parentmodel = this.c1.defineModel('type1', {
        hi: 3
      });
      childmodel1 = this.c1.defineModel('type1', {
        childmodel: 1
      });
      childmodel2 = this.c2.defineModel('type2', {
        childmodel: 2
      });
      child1 = new childmodel1({
        some_value: 5
      });
      child2 = new childmodel2({
        some_value: 6
      });
      return child1.flush(function() {
        return child2.flush(function() {
          var parent;
          parent = new parentmodel({
            testdict: {
              bla: child1,
              bla2: 3
            },
            child2: child2,
            ar: [child1, 3, 4, 'ggg']
          });
          return parent.exportReferences(parent.attributes, function(err, exported) {
            var expected;
            expected = {
              testdict: {
                bla: {
                  "_r": child1.get('id'),
                  "_c": 'test'
                },
                bla2: 3
              },
              child2: {
                "_r": child2.get('id'),
                "_c": 'test2'
              },
              ar: [
                {
                  "_r": child1.get('id'),
                  "_c": 'test'
                }, 3, 4, 'ggg'
              ],
              _t: 'type1'
            };
            test.deepEqual(exported, expected);
            return child1.del(function() {
              return child2.del(function() {
                return test.done();
              });
            });
          });
        });
      });
    },
    importReferences: function(test) {
      var child1, child2, childmodel1, childmodel2, parentmodel;
      parentmodel = this.c1.defineModel('type1', {
        hi: 3
      });
      childmodel1 = this.c1.defineModel('type1', {
        childmodel: 1
      });
      childmodel2 = this.c2.defineModel('type2', {
        childmodel: 2
      });
      child1 = new childmodel1({
        some_value: 5
      });
      child2 = new childmodel2({
        some_value: 6
      });
      return child1.flush(__bind(function() {
        return child2.flush(__bind(function() {
          var parent;
          parent = new parentmodel({
            testdict: {
              bla: child1,
              bla2: 3
            },
            child2: child2,
            ar: [child1, 3, 4, 'ggg']
          });
          return parent.flush(__bind(function(err, id) {
            return this.c1.findModel({
              id: id
            }, function(err, model) {
              return model.get('child2').resolve(function(myclass) {
                test.equals(model.get('child2').get('some_value'), 6);
                return parent.del(function() {
                  return child1.del(function() {
                    return child2.del(function() {
                      return test.done();
                    });
                  });
                });
              });
            });
          }, this));
        }, this));
      }, this));
    }
  };
  exports.Permissions = {
    setUp: function(callback) {
      var realcollection;
      this.remotemodel = require('./remotemodel');
      this.mongoC = require('./serverside/mongodb');
      this.collections = require('./collections');
      this.mongo = require('mongodb');
      this.db = new this.mongo.Db('testdb', new this.mongo.Server('localhost', 27017), {
        safe: true
      });
      this.c = realcollection = new this.mongoC.MongoCollectionNode({
        db: this.db,
        collection: 'test'
      });
      return this.db.open(callback);
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    },
    getPermission: function(test) {
      var attribute, model, realm, x;
      model = this.c.defineModel('bla', {
        permissions: {
          xxx: [
            new this.remotemodel.Permission({
              v: 'bobby',
              matchRealm: v({
                user: 'bobby'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            }), new this.remotemodel.Permission({
              v: 'bob',
              matchRealm: v({
                user: 'bob'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            }), new this.remotemodel.Permission({
              v: 'bob2',
              matchRealm: v({
                user: 'bob'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            })
          ]
        }
      });
      x = new model();
      realm = {
        user: 'bob'
      };
      attribute = 'xxx';
      return x.getPermission(attribute, realm, function(err, permission) {
        test.equals(permission.get('v'), 'bob');
        return permission.chew("LALA", {
          realm: realm,
          attribute: attribute
        }, function(err, data) {
          test.equals(data, 'BLAbobLALA');
          return test.done();
        });
      });
    },
    applyPermission: function(test) {
      var attribute, model, realm, x;
      model = this.c.defineModel('bla', {
        permissions: {
          xxx: [
            new this.remotemodel.Permission({
              v: 'bobby',
              matchRealm: v({
                user: 'bobby'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            }), new this.remotemodel.Permission({
              v: 'bob',
              matchRealm: v({
                user: 'bob'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            }), new this.remotemodel.Permission({
              v: 'bob2',
              matchRealm: v({
                user: 'bob'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            })
          ]
        }
      });
      x = new model();
      realm = {
        user: 'bob'
      };
      attribute = 'xxx';
      return x.applyPermission(attribute, 'LALA', realm, function(err, data) {
        test.equals(data, 'BLAbobLALA');
        return test.done();
      });
    },
    applyPermissions: function(test) {
      var data, model, realm, x;
      model = this.c.defineModel('bla', {
        permissions: {
          xxx: [
            new this.remotemodel.Permission({
              v: 'bobby',
              match: v({
                user: 'bobby'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            }), new this.remotemodel.Permission({
              v: 'bob',
              match: v({
                user: 'bob'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            }), new this.remotemodel.Permission({
              v: 'bob2',
              match: v({
                user: 'bob'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "BLA" + data.realm.user + value);
              }
            })
          ],
          yyy: [
            new this.remotemodel.Permission({
              match: v({
                user: 'bob'
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "yyy" + data.realm.user + "NOBLA");
              }
            }), new this.remotemodel.Permission({
              match: v({
                user: 'bob',
                bla: true
              }),
              chew: function(value, data, callback) {
                return callback(void 0, "yyy" + data.realm.user + data.realm.bla);
              }
            })
          ]
        }
      });
      x = new model();
      realm = {
        user: 'bob',
        bla: 3
      };
      data = {
        xxx: "set_to_something",
        yyy: "set_to_something_else"
      };
      return x.applyPermissions({
        xxx: "set_to_something",
        yyy: "set_to_something_else"
      }, realm, function(err, data) {
        test.equal(err, void 0);
        test.deepEqual(data, {
          xxx: 'BLAbobset_to_something',
          yyy: 'yyybobNOBLA'
        });
        return x.applyPermissions({
          xxx: "k",
          yyy: "set_to_something_else"
        }, {
          user: 'bob'
        }, function(err, data) {
          test.equal(err, void 0);
          test.deepEqual(data, {
            xxx: 'BLAbobk',
            yyy: 'yyybobNOBLA'
          });
          return x.applyPermissions({
            xxx: "k",
            yyy: "set_to_something_else",
            zzz: "fail?"
          }, {
            user: 'bob'
          }, function(err, data) {
            test.equal(err, "permission denied for attribute zzz");
            test.equal(data, void 0);
            return x.applyPermissions({
              xxx: "k",
              yyy: "set_to_something_else",
              zzz: "fail?",
              bbb: "fail2!"
            }, {
              user: 'bob'
            }, function(err, data) {
              return test.done();
            });
          });
        });
      });
    }
  };
  exports.EverythingTogether = {
    setUp: function(callback) {
      var realcollection;
      this.mongoC = require('./serverside/mongodb');
      this.collections = require('./collections');
      this.mongo = require('mongodb');
      this.db = new this.mongo.Db('testdb', new this.mongo.Server('localhost', 27017), {
        safe: true
      });
      this.realcollection = realcollection = new this.mongoC.MongoCollectionNode({
        db: this.db,
        collection: 'test'
      });
      this.c = new this.collections.RemoteCollection({
        db: this.db,
        name: 'test'
      });
      realcollection.connect(this.c);
      return this.db.open(callback);
    },
    tearDown: function(callback) {
      this.db.close();
      return callback();
    },
    defineModel: function(test) {
      var newmodel1, newmodel2;
      newmodel1 = this.c.defineModel('bla1', {
        hi: function() {
          return 'bla1';
        }
      });
      newmodel2 = this.c.defineModel('bla2', {
        hi: function() {
          return 'bla2';
        }
      });
      test.equals(this.c.resolveModel({
        _t: 'bla2'
      }), newmodel2);
      return test.done();
    },
    call: function(test) {
      var clientsideModel, instance1, serversideModel;
      clientsideModel = this.c.defineModel('bla1', {
        hi: function() {
          var args, callback, _i;
          args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), callback = arguments[_i++];
          return this.localCallPropagade('hi', args, callback);
        }
      });
      serversideModel = this.realcollection.defineModel('bla1', {
        hi: function(n, callback) {
          return callback(void 0, n + 2);
        }
      });
      instance1 = new clientsideModel({
        something: 666
      });
      return instance1.flush(__bind(function() {
        test.equals(Boolean(instance1.get('id')), true);
        return instance1.hi(3, function(err, data) {
          test.equals(err, void 0);
          test.equals(data, 5);
          return instance1.del(test.done);
        });
      }, this));
    },
    findOne: function(test) {
      var instance1, instance2, newmodel1;
      newmodel1 = this.c.defineModel('findonetest', {
        hi: function() {
          return 'bla1';
        }
      });
      instance1 = new newmodel1({
        blabla: 3,
        f: 5
      });
      instance2 = new newmodel1({
        blabla: 3,
        f: 8
      });
      return instance1.flush(__bind(function() {
        return instance2.flush(__bind(function() {
          test.equals(Boolean(instance1.get('id')), true, "instance1 didn't get an id");
          test.equals(Boolean(instance2.get('id')), true, "instance2 didn't get an id");
          test.notEqual(instance1.get('id', instance2.get('id')));
          return this.c.findModel({
            id: instance1.get('id')
          }, __bind(function(err, model) {
            var found;
            test.equals(Boolean(model), true, "didn't get instance1 model");
            found = false;
            return this.c.findModel({
              blabla: 3
            }, __bind(function(err, model) {
              test.equals(Boolean(model), true, "didn't get findOne model");
              if (found) {
                test.fail('findmodel returned two results');
              }
              found = true;
              return this.c.findModel({
                something_nonexistant: 'nonexistant'
              }, __bind(function(nonexistant) {
                test.equals(nonexistant, void 0);
                return instance1.del(__bind(function() {
                  return instance2.del(__bind(function() {
                    return test.done();
                  }, this));
                }, this));
              }, this));
            }, this));
          }, this));
        }, this));
      }, this));
    },
    flush: function(test) {
      var instance1, newmodel1, newmodel2;
      newmodel1 = this.c.defineModel('bla1', {
        hi: function() {
          return 'bla1';
        }
      });
      newmodel2 = this.c.defineModel('bla2', {
        hi: function() {
          return 'bla2';
        }
      });
      instance1 = new newmodel1({
        everythingtogether: 666
      });
      return instance1.flush(__bind(function() {
        test.equals(Boolean(instance1.get('id')), true);
        instance1.set({
          somethingelse: 667
        });
        return instance1.flush(__bind(function() {
          var found;
          found = false;
          return this.c.findModels({
            somethingelse: 667
          }, {}, __bind(function(instance2) {
            var id;
            if (!instance2) {
              if (found) {
                return test.done();
              } else {
                return test.fail();
              }
            } else {
              found = true;
              test.equals(instance2.get('everythingtogether'), 666);
              test.deepEqual(_.omit(instance2.attributes, 'id'), _.omit(instance1.attributes, 'id'));
              test.deepEqual(_.omit(instance2.attributes, 'id'), {
                _t: 'bla1',
                everythingtogether: 666,
                somethingelse: 667
              });
              test.equals(instance2.get('id').constructor, String);
              id = instance2.get('id');
              return instance2.del(__bind(function() {
                return this.c.findModels({
                  id: id
                }, {}, __bind(function(model) {
                  if (model) {
                    return test.fail();
                  } else {
                    return false;
                  }
                }, this));
              }, this));
            }
          }, this));
        }, this));
      }, this));
    }
  };
}).call(this);
