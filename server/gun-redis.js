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

flint.Flint.register(new flint.DeltaAdapter({
  get: function(key, done, done2) {
    var redis = this.redis;
    const promise =  new Promise(function (resolve, reject) {
      get(redis, key, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (done) {
      return promise.then(function (result) {
        // TODO: done2 is subkey could optimize
        console.log("subkey fetch", key, done);
        if (done2) {
          done2((result || {})[done]);
        } else {
          done(result);
        }
      });
    } else {
      return promise;
    }
  },

  put: function(delta, done) {
    if (!delta || !done) return done(this.errors.internal);
    var redis = this.redis;
    Promise.all(Object.keys(delta).map(function(key) {
      console.log("put", key);
      const node = delta[key];
      var data = toRedis(node);
      return new Promise(function (resolve, reject) {
        redis.hmset(key, data, function(err) {
          if(err) return reject(err);
          return resolve();
        });
      });
    })).then(function () {
      done && done(null);
    }).catch(function (err) {
      done && done(err);
    });
  },

  opt: function(context) {
    this.redis = redis.createClient();
    context.gun.redis = this;
    this.redis.on("error", function(err) {
      console.error("redis error", err.stack || err);
    });

    /*
    var put = this.put.bind(this);

    context.on("put", function(node) {
      Object.keys((node && node.put) || {}).forEach(function(soul) {
        node.put[soul] && put(soul, node.put[soul], null, false);
      });
    });
    */
  }
}));
