/* globals Promise */
import Gun from "gun/gun";
import redisNode from "redis";
import flatten from "flat";
import unfuck from "./unfuck-redis";

const FIELD_SIZE_LIMIT=100000;


Gun.on("create", function(db) {
  this.to.next(db);

  const redis = redisNode.createClient();


  const redisGetNode = soul => new Promise((resolve, reject) => {
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

  db.redis = { get: redisGetNode };

  db.on("get", function(request) {
    this.to.next(request);
    const dedupId = request["#"];
    const get = request.get;
    const soul = get["#"];
    // const field = get["."];
    redisGetNode(soul)
      .then(result => db.on("in", {
        "@": dedupId,
        put: result ? { [soul]: result } : null,
        err: null
      }))
      .catch(err => console.error("error", err.stack || err) || db.on("in", {
        "@": dedupId,
        put: null,
        err
      }));
  });

  db.on("put", function(request) {
    this.to.next(request);

    const delta = request.put;
    const dedupId = delta["#"];
    Promise.all(Object.keys(delta).map(soul => new Promise((resolve, reject) => {
      const node = delta[soul];
      const data = toRedis(node);
      redis.hmset(soul, data, err => err ? reject(err) : resolve());
    })))
      .then(() => db.on("in", {
        "#": dedupId,
        ok: true,
        err: null
      }))
      .catch(err => db.on("in", {
        "#": dedupId,
        ok: false,
        err: err
      }));
  });
});

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
