/* globals Promise */
import * as R from "ramda";
import {
  chainInterface,
  Receiver,
  deduplicateMessages,
  allowLeech,
  relayMessages,
  cluster,
  websocketTransport
} from "gun-receiver";
import { receiver as redis } from "gun-redis";
import { Validation } from "notabug-peer";
const Gun = require("gun/gun");

const validateMessage = ({ json, skipValidation, ...msg }) => {
  if (skipValidation) return { ...msg, json };
  return Validation.suppressor.validate(json).then(validated => {
    if (!validated)
      return console.error(Validation.suppressor.validate.errors, json);
    return { ...msg, json: validated };
  });
};

const redisSupport = R.pipe(
  redis.respondToGets(Gun, { disableRelay: true }),
  chainInterface,
  redis.acceptWrites(Gun, { disableRelay: true })
);

const skipValidatingKnownData = db => {
  db.onIn(msg => {
    if (msg.skipValidation || !db.get || !msg.json || !msg.json.put) return msg;
    const souls = R.keys(msg.json.put);

    if (!souls.length) return msg;
    return Promise.all(
      souls.map(soul =>
        db.get(soul, { noRelay: true }).then(existing => {
          const updated = msg.json.put[soul];

          if (!existing || !updated) return true;
          const propNames = R.without(["_"], R.keys(updated));
          const modifiedKey = propNames.find(
            name => !R.equals(existing[name], updated[name])
          );

          return modifiedKey;
        })
      )
    ).then(hasChanges => {
      if (!hasChanges.length || hasChanges.find(x => x)) return msg;
      return { ...msg, skipValidation: true };
    });
  });

  return db;
};

export default opts =>
  R.pipe(
    Receiver,
    opts.redis ? skipValidatingKnownData : R.identity,
    db => db.onIn(validateMessage) && db,
    deduplicateMessages,
    allowLeech,
    opts.redis ? redisSupport : R.identity,
    relayMessages,
    cluster,
    // db => db.onOut(validateMessage) && db,
    opts.port || opts.web ? websocketTransport.server(opts) : R.identity,
    ...opts.peers.map(peer => websocketTransport.client(peer))
  )(opts);
