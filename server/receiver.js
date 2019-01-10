import { pipe, identity } from "ramda";
import {
  chainInterface,
  preventConflicts,
  Receiver,
  deduplicateMessages,
  allowLeech,
  redisBackend,
  relayMessages,
  websocketTransport
} from "gun-receiver";
import { suppressor } from "./notabug-peer/json-schema-validation";

const validateMessage = ({ json, skipValidation, ...msg }) => {
  if (skipValidation) return { ...msg, json };
  return suppressor.validate(json).then(validated => {
    if (!validated) return console.error(suppressor.validate.errors, json);
    return { ...msg, json: validated };
  });
};

export default opts =>
  pipe(
    Receiver,
    db => db.onIn(validateMessage) && db,
    deduplicateMessages,
    allowLeech,
    opts.redis
      ? pipe(
          redisBackend.respondToGets,
          chainInterface,
          preventConflicts
        )
      : identity,
    relayMessages,
    db => db.onOut(validateMessage) && db,
    opts.port || opts.web ? websocketTransport.server(opts) : identity
  )(opts);
