/* globals Promise */
const { keys, path, prop } = require("ramda");
const uuid = require("uuid");
const flatten = require("flat");
const redisApi = require("redis");

const FIELD_SIZE_LIMIT = 100000;

const respondToGets = db => {
  const redis = redisApi.createClient();

  const readFullNode = soul =>
    new Promise((resolve, reject) => {
      if (!soul) return resolve(null);
      redis.hgetall(soul, function(err, res) {
        if (err) {
          console.error("get error", err);
          reject(err);
        } else {
          var data = fromRedis(res);
          resolve(data);
        }
      });
    });

  db.onIn(msg => {
    const { from, json } = msg;
    const soul = path(["get", "#"], json);
    const dedupId = prop("#", json);
    if (!soul) return msg;
    return readFullNode(soul).then(result => {
      const json = {
        "#": uuid.v4(),
        "@": dedupId,
        put: { [soul]: result || undefined }
      };
      // Skip validation to avoid losing undefined when no result
      from.send({ json, ignoreLeeching: true, skipValidation: !result });
      if (!result) return msg; // allow next handler
      // Pass through oracle queries
      return soul.indexOf("@~") === -1 ? null : msg;
    });
  });

  return db;
};

module.exports = { respondToGets };

function fromRedis(obj) {
  if (!obj) return obj;
  const sorted = {};

  Object.keys(obj).forEach(function(key) {
    if (key[0] === ".") delete obj[key];

    if (obj[key] === "|NULL|") {
      obj[key] = null;
    }
    if (obj[key] === "|UNDEFINED|") {
      obj[key] = undefined;
    }

    if (/>\./.test(key)) {
      obj[key] = parseFloat(obj[key], 10) || obj[key];
    }
    if (obj[key] && obj[key].length > FIELD_SIZE_LIMIT) {
      obj[key] = obj[key].slice(0, FIELD_SIZE_LIMIT);
      console.log("truncated", key);
    }
  });

  obj = unfuck(flatten.unflatten(obj));
  Object.keys(obj)
    .sort()
    .forEach(key => (sorted[key] = obj[key]));

  return sorted;
}

const unfuck = obj => {
  // This is only necessary if you are stupid like me and use the default . delimiter for flatten
  if (!obj) return obj;
  var arrow = (obj._ && obj._[">"]) || {};
  keys(arrow).forEach(function(key) {
    var value = arrow[key];
    if (typeof value === "object") {
      var valKeys = keys(value);
      var remainder = valKeys[0];
      if (remainder) {
        var realKey = [key, valKeys].join(".");
        var realValue = value[remainder];
        delete arrow[key];
        arrow[realKey] = realValue;
        realValue = (obj[key] && obj[key][remainder]) || null;
        delete obj[key];
        obj[realKey] = realValue;
      }
    }
  });
  keys(obj).forEach(key => {
    if (key[0] === ".") delete [key];
  });
  return obj;
};
