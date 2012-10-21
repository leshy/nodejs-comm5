(function() {
  var _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require('underscore');
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
      this.c.create({
        bla: 3
      }, function(err, data) {
        if ((data != null) && !(err != null)) {
          this.created = data;
          return test.done();
        } else {
          return test.fail();
        }
      });
      return this.c.find({
        bla: 3
      }, {}, function(entry) {
        if (String(entry != null ? entry._id : void 0) === this.created) {
          found = true;
        }
        if (!(entry != null)) {
          test.equals(found, true);
          return test.done();
        }
      });
    },
    remove: function(test) {
      return this.c.create({
        bla: 3
      }, __bind(function(err, id) {
        if ((typeof data !== "undefined" && data !== null) && (err != null)) {
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
        if (msg) {
          return console.log(msg.data);
        } else {
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
        if (msg) {
          return console.log(msg.data);
        } else {
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
        if (msg) {
          return console.log(msg.data);
        } else {
          return test.done();
        }
      });
    },
    remove_raw: function(test) {
      var response;
      response = this.c.msg({
        collection: 'test',
        remove: {
          bla: 3
        },
        raw: true
      });
      return response.read(function(msg) {
        if (msg) {
          return console.log(msg.data);
        } else {
          return test.done();
        }
      });
    }
  };
}).call(this);
