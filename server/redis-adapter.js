/* globals Promise */
import Gun from "gun/gun";
import { pathOr, pick } from "ramda";
import redisNode from "redis";
import flatten from "flat";
import unfuck from "./unfuck-redis";

const FIELD_SIZE_LIMIT=100000;
const GET_BATCH_SIZE=10000;
const PUT_BATCH_SIZE=10000;

const metaRe = /^_\..*/;
const edgeRe = /(\.#$)/;

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
    redis.hkeys(soul, (err, keys) => {
      if (err) {
        console.error("error", err.stack || err);
        db.on("in", {
          "@": dedupId,
          put: null,
          err
        });
        return;
      }
      (new Promise((resolve, reject) => {
        if (keys.length > GET_BATCH_SIZE) {
          console.log("get big soul", soul, keys.length);
          const attrKeys = keys.filter(key => !key.match(metaRe));
          const readBatch = () => new Promise((ok, fail) => {
            const batch = attrKeys.splice(0, GET_BATCH_SIZE);
            if (!batch.length) return ok(true);
            const batchMeta = batch.map(key => `_.>.${key}`.replace(edgeRe, ""));
            redis.hmget(soul, batchMeta, (err, meta) => {
              if (err) return console.error("hmget err", err.stack || err) || fail(err);
              const obj = {
                "_.#": soul
              };
              meta.forEach((val, idx) => obj[batchMeta[idx]] = val);
              redis.hmget(soul, batch, (err, res) => {
                if (err) return console.error("hmget err", err.stack || err) || fail(err);
                res.forEach((val, idx) => obj[batch[idx]] = val);
                const result = fromRedis(obj);
                db.on("in", {
                  "@": dedupId,
                  put: { [soul]: result },
                  err: null
                });
                ok();
              });
            });
          });
          const readNextBatch = () => readBatch().then(done => !done && readNextBatch);
          return readNextBatch().then(resolve).catch(reject);
        }
        redisGetNode(soul)
          .then(result => db.on("in", {
            "@": dedupId,
            put: result ? { [soul]: result } : null,
            err: null
          }))
          .catch(reject);
      })).catch(err => console.error("error", err.stack || err) || db.on("in", {
        "@": dedupId,
        put: null,
        err
      }));
    });
  });

  db.on("put", function(request) {
    this.to.next(request);

    const delta = request.put;
    const dedupId = delta["#"];
    Promise.all(Object.keys(delta).map(soul => new Promise((resolve, reject) => {
      const node = delta[soul];
      const meta = pathOr({}, ["_", ">"], node);
      const keys = Object.keys(meta);
      const writeNextBatch = () => {
        const batch = keys.splice(0, PUT_BATCH_SIZE);
        if (!batch.length) return resolve();
        const updates = toRedis({
          "_": {
            "#": soul,
            ">": pick(batch, meta)
          },
          ...pick(batch, node)
        });
        redis.hmset(soul, toRedis(updates), err => err ? reject(err) : writeNextBatch());
      };
      return writeNextBatch();
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
