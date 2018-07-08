/* globals Promise */
var flint = require("gun-flint");
var redis = require("redis");
var flatten = require("flat");

function toRedis(obj) {
  if (!obj) return obj;

  obj = flatten(obj);

  Object.keys(obj).forEach(function(key) {
    if (obj[key] === null) {
      obj[key] = "|NULL|";
    }
    if (obj[key] === undefined) {
      obj[key] = "|UNDEFINED|";
    }
  });

  return obj;
}

function fromRedis(obj) {
  if (!obj) return obj;

  Object.keys(obj).forEach(function(key) {
    if (obj[key] === "|NULL|") {
      obj[key] = null;
    }
    if (obj[key] === "|UNDEFINED|") {
      obj[key] = undefined;
    }

    if (key === "timestamp" || key === "lastActive") {
      obj[key] = parseInt(obj[key], 10) || 0;
    }
  });
  obj = flatten.unflatten(obj);
  return obj;
}

var get = function(redis, key, done) {
  if (!key) return done(null, null);
  redis.hgetall(key, function(err, res) {
    if (err) {
      console.error("get error", err);
      done && done(err);
    } else {
      var data = fromRedis(res);
      done && done(null, data);
    }
  });
};

flint.Flint.register(new flint.NodeAdapter({
  get: function(key, done) {
    var redis = this.redis;
    if (done) {
      return get(redis, key, done);
    } else {
      return new Promise(function (resolve, reject) {
        get(redis, key, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    }
  },

  put: function(key, node, done) {
    if (key == null || node === null) return done(this.errors.internal);
    var redis = this.redis;

    var data = toRedis(node);
    redis.hmset(key, data, function(err) {
      if(err) {
        console.error("put error", err);
        done && done(err);
      } else {
        done && done(null);
      }
    });
  },

  opt: function(context) {
    this.redis = redis.createClient();
    context.gun.redis = this;
    this.redis.on("error", function(err) {
      console.error("redis error", err.stack || err);
    });

    var put = this.put.bind(this);

    context.on("put", function(node) {
      Object.keys((node && node.put) || {}).forEach(function(soul) {
        put(soul, node.put[soul]);
      });
    });
  }
}));
