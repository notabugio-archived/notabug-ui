/* globals Promise */
var flint = require("gun-flint");
var redis = require("redis");
var flatten = require("flat");
var unfuck = require("./unfuck-redis");

var FIELD_SIZE_LIMIT=100000;

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
    if (obj[key] && obj[key].length > FIELD_SIZE_LIMIT) {
      obj[key] = obj[key].slice(0, FIELD_SIZE_LIMIT);
      console.log("truncated input", key);
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

    if (key === "timestamp" || key === "lastActive" || />\./.test(key)) {
      obj[key] = parseInt(obj[key], 10) || 0;
    }
    if (obj[key] && obj[key].length > FIELD_SIZE_LIMIT) {
      obj[key] = obj[key].slice(0, FIELD_SIZE_LIMIT);
      console.log("truncated", key);
    }
  });

  obj = unfuck(flatten.unflatten(obj));

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
      if (key === "~0R5jFQNX4ff0gYPQwqg67qV8rmNLjp2gqyc7lkmvpSY.5lupP8_MAS3rIkdcPv9AiWZ93KcGD4zTSoPKn4nNI4k") {
        console.log("data", data);
      }
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

  put: function(key, node, done, shouldLog=true) {
    if (!key || !node) return done(this.errors.internal);
    var redis = this.redis;

    shouldLog && console.log("put", key, node);

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
        node.put[soul] && put(soul, node.put[soul], null, false);
      });
    });
  }
}));
