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

    if (key === "timestamp") {
      obj[key] = parseInt(obj[key], 10) || 0;
    }
  });
  obj = flatten.unflatten(obj);
  return obj;
}

flint.Flint.register(new flint.NodeAdapter({
  get: function(key, done) {
    if (!key) return done(null, null);
    this.redis.hgetall(key, function(err, res) {
      if (err) {
        console.error("get error", err);
        done(err);
      } else {
        var data = fromRedis(res);
        done(null, data);
      }
    });
  },

  put: function(key, node, done) {
    if (node == null) return done(this.errors.internal);
    var data = toRedis(node);
    this.redis.hmset(key, data, function(err) {
      if(err) {
        console.error("put error", err);
        done(err);
      } else {
        done(null);
      }
    });
  },

  opt: function() {
    this.redis = redis.createClient();
    this.redis.on("error", function(err) {
      console.error("redis error", err.stack || err);
    });
  }
}));
