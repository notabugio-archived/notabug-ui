import { compose, path, prop, keys, without } from "ramda";
import objHash from "object-hash";
import { createSuppressor } from "gun-suppressor";
import * as sea from "gun-suppressor-sear";
import { definitions, routes } from "./json-schema";

const validateIsLegacyThing = (schema, data) => {
  const dataSoul = path(["data", "#"], data);
  const newest = without(
    ["comments", "allcomments", "votesup", "votesdown"],
    keys(path(["_", ">"], data))
  )
    .map(key => path(["_", ">", key], data))
    .sort()
    .pop();
  const { thingId } = routes.ThingData.match(dataSoul) || {};
  const id = prop("id", data);
  return id && id === thingId && newest && newest < 1543102814945;
};

const validateThingHashMatchesSoul = (_schema, data) => {
  const id = prop("id", data);
  return (
    id &&
    id ===
      objHash({
        authorId: (path(["author", "#"], data) || "").substr(1) || undefined,
        timestamp: parseInt(prop("timestamp", data)),
        kind: prop("kind", data),
        topic: prop(
          "topicName",
          routes.Topic.match(path(["topic", "#"], data))
        ),
        opId: prop("thingId", routes.Thing.match(path(["op", "#"], data))),
        replyToId: prop(
          "thingId",
          routes.Thing.match(path(["replyTo", "#"], data))
        ),
        originalHash: prop("originalHash", data)
      })
  );
};

const validateSignedThingDataMatches = (_schema, data) => {
  const authorId = (path(["author", "#"], data) || "").substr(1) || undefined;
  const signedId = prop(
    "authorId",
    routes.ThingDataSigned.match(path(["data", "#"], data))
  );
  return authorId && authorId === signedId;
};

const validateThingDataMatchesOriginalHash = (_schema, data) => {
  const originalHash = prop("originalHash", data);
  const id = prop("thingId", routes.ThingData.match(path(["data", "#"], data)));
  return id && id === originalHash;
};

const validateThingRelatedEdge = ajv => (
  nodeTypeName,
  data,
  _pSchema,
  _cPath,
  parentData
) => {
  const { thingId } =
    routes.Thing.match(path(["_", "#"], parentData) || "") || {};
  const { thingId: propThingId } = routes[nodeTypeName].match(
    prop("#", data) || ""
  );
  if (!thingId || thingId !== propThingId) return false;
  return ajv.compile({ $ref: `schema.json#/definitions/${nodeTypeName}Edge` })(
    data
  );
};

const validateThingDataHash = (_schema, data) => {
  const { _, ...record } = data || {}; // eslint-disable-line no-unused-vars
  record.timestamp = parseFloat(record.timestamp, 10);
  const { thingId } =
    routes.ThingData.match(path(["_", "#"], data) || "") || {};
  return thingId && thingId === objHash(record);
};

const validateKeysAreProofsOfWork = (schema, data) => {
  const argon2 = require("argon2");
  if (!argon2) return true; // in browser don't bother for now
  const { algorithm = "argon2d", config = {} } = schema || {};
  const prefix = path(["_", "#"], data);
  if (algorithm !== "argon2d")
    throw new Error("Only argon2 supported for vote hashes");
  without(["_"], keys(data)).forEach(vote => {
    const nonce = Buffer.hasOwnProperty("from")
      ? Buffer.from(vote, "hex")
      : new Buffer(vote, "hex");
    const salt = Buffer.hasOwnProperty("from")
      ? Buffer.from(nonce, "hex")
      : new Buffer(nonce, "hex");
    const hash = argon2.hash(prefix, {
      salt,
      hashLength: config.hashLength,
      timeCost: config.timeCost,
      memoryCost: config.memoryCost,
      parallelism: config.parallelism,
      raw: true,
      type: argon2[algorithm]
    });
    let off = 0;
    let i;
    for (i = 0; i <= config.complexity - 8; i += 8, off++) {
      if (hash[off] !== 0) return false;
    }
    const mask = 0xff << (8 + i - config.complexity);
    const isValid = (hash[off] & mask) === 0;
    if (!isValid) {
      console.log("invalid vote", prefix, vote);
      delete data[vote];
    }
  });
  return true;
};

const initAjv = compose(
  ajv => {
    ajv.addKeyword("isLegacyThing", {
      validate: validateIsLegacyThing
    });
    ajv.addKeyword("thingHashMatchesSoul", {
      validate: validateThingHashMatchesSoul
    });
    ajv.addKeyword("signedThingDataMatchesThing", {
      validate: validateSignedThingDataMatches
    });
    ajv.addKeyword("thingDataMatchesOriginalHash", {
      validate: validateThingDataMatchesOriginalHash
    });
    ajv.addKeyword("thingRelatedEdge", {
      validate: validateThingRelatedEdge(ajv)
    });
    ajv.addKeyword("thingDataHashMatchesSoul", {
      validate: validateThingDataHash
    });
    ajv.addKeyword("keysAreProofsOfWork", {
      validate: validateKeysAreProofsOfWork,
      modifying: true
    });
    return ajv;
  },
  sea.initAjv
);

export const suppressor = createSuppressor({ definitions, init: initAjv });

export function validateWireInput(peer, context) {
  context.on("in", function wireInput(msg) {
    const _ = msg["_"];
    delete msg["_"];
    if ("ping" in msg || "leech" in msg) return;
    if (msg.put && !keys(msg.put).length) return;
    const promise = peer.config.disableValidation
      ? Promise.resolve(msg)
      : suppressor.validate(msg);
    promise
      .then(validated => {
        if (!validated) return console.log("msg didn't validate", msg);
        msg["_"] = _;
        this.to.next(msg);
      })
      .catch(err => console.error("validate err", msg, err.stack || err));
  });
}
