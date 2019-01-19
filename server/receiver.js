import { pipe, identity } from "ramda";
import {
  chainInterface,
  preventConflicts,
  Receiver,
  deduplicateMessages,
  allowLeech,
  relayMessages,
  websocketTransport
} from "gun-receiver";
import { receiver as redis } from "gun-redis";
import { suppressor } from "./notabug-peer/json-schema-validation";
const Gun = require("gun/gun");

const validateMessage = ({ json, skipValidation, ...msg }) => {
  if (skipValidation) return { ...msg, json };
  return suppressor.validate(json).then(validated => {
    if (!validated) return console.error(suppressor.validate.errors, json);
    return { ...msg, json: validated };
  });
};

const redisSupport = pipe(
  redis.respondToGets(Gun),
  chainInterface,
  preventConflicts
);

export default opts =>
  pipe(
    Receiver,
    db => db.onIn(validateMessage) && db,
    deduplicateMessages,
    allowLeech,
    opts.redis ? redisSupport : identity,
    relayMessages,
    db => db.onOut(validateMessage) && db,
    opts.port || opts.web ? websocketTransport.server(opts) : identity,
    ...opts.peers.map(peer => websocketTransport.client(peer))
  )(opts);
