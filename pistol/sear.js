/* globals Promise */
const { compose, path, assoc } = require("ramda");
const Route = require("route-parser");
const { TextEncoder } = require("text-encoding");
const WebCrypto = require("node-webcrypto-ossl");
const Buffer = require("gun/sea/buffer");
const { PERMISSIVE_SCHEMA: GUN_PERMISSIVE_SCHEMA, initAjv: ajvBaseInit } = require("./suppressor");
const ossl = new WebCrypto({ directory: "ossl" }).subtle;

const SHUF_DATE = 1546329600000; // Jan 1, 2019
const signConf = { name: "ECDSA", hash: { name: "SHA-256" } };
const pairConf = { name: "ECDSA", namedCurve: "P-256" };
const authorPattern = "~:authorId";
const seaAuthorRoute = new Route(authorPattern);
const seaSoulRoute = new Route("*stuff~:authorId.");

const MAX_AUTHOR_ALIAS_SIZE = 512;
const MAX_AUTHOR_ID_SIZE = 128; // ???

const AUTH_SCHEMA = {
  seaAlias: { type: "string", maxLength: MAX_AUTHOR_ALIAS_SIZE },
  SEAAlias: {
    title: "Gun SEA Alias",
    $async: true,
    additionalProperties: true, // TODO: define schema
    soul: {
      pattern: "~@:alias",
      properties: {
        alias: { $ref: "schema.json#/definitions/seaAlias" }
      },
      required: ["alias"]
    },
    nodes: ["SEAAuthor"]
  },
  seaAuthorId: { type: "string", maxLength: MAX_AUTHOR_ID_SIZE },
  seaAuthObj: {
    oneOf: [
      {
        type: "object",
        properties: {
          ek: { type: "string" },
          s: { type: "string" }
        }
      },
      {
        type: "string"
      }
    ]
  },
  SEAAuthor: {
    title: "Gun SEA Author",
    $async: true,
    properties: {
      pub: { $ref: "#/definitions/seaAuthorId" },
      epub: { sea: { type: "string" } },
      alias: { sea: { $ref: "schema.json#/definitions/seaAlias" } },
      auth: {
        sea: { $ref: "schema.json#/definitions/seaAuthObj" }
      }
    },
    additionalProperties: {
      sea: {
        anyOf: [
          { $ref: "schema.json#/definitions/GunNodeMeta" },
          { $ref: "schema.json#/definitions/GunEdge" },
          { $ref: "schema.json#/definitions/seaAuthObj" },
          { type: "null" },
          { type: "string" },
          { type: "number" },
          { type: "boolean" }
        ]
      }
    },
    soul: {
      pattern: authorPattern,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      },
      required: ["authorId"]
    }
  }
};

const PERMISSIVE_NODE_SCHEMA = {
  title: "Gun SEA Node",
  description: "Any SEA node supported by gun",
  $async: true,

  soul: {
    pattern: "*path~:authorId.",
    properties: {
      path: { type: "string" },
      authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
    },
    required: ["path", "authorId"]
  },

  additionalProperties: {
    ".*": {
      sea: {
        anyOf: [
          { $ref: "schema.json#/definitions/GunNodeMeta" },
          { $ref: "schema.json#/definitions/GunEdge" },
          { type: "null" },
          { type: "string" },
          { type: "number" },
          { type: "boolean" }
        ]
      }
    }
  }
};


const PERMISSIVE_SCHEMA = {
  ...AUTH_SCHEMA,
  SEANode: PERMISSIVE_NODE_SCHEMA,
  ...GUN_PERMISSIVE_SCHEMA
};

const initAjv = compose(
  ajv => {
    ajv.addKeyword("sea", {
      async: true,
      modifying: true,
      validate: validateSeaProperty(ajv)
    });
    return ajv;
  },
  ajvBaseInit
);

const validateSeaProperty = ajv => (
  schema,
  data,
  pSchema,
  cPath,
  parentData,
  keyInParent
) => {
  const soul = path(["_", "#"], parentData);
  if (keyInParent === "_") return true;
  const { authorId } =
    seaSoulRoute.match(soul) || seaAuthorRoute.match(soul) || {};
  if (!authorId) return false;
  if (soul === `~${authorId}` && keyInParent === "pub")
    return data === authorId;
  // Validate as an object to give property validators more context
  const validate = ajv.compile({
    additionalProperties: true,
    properties: {
      [keyInParent]: schema
    }
  });
  let result;
  return read(parentData, keyInParent, authorId)
    .then(res => (result = res))
    .then(res => assoc(keyInParent, res, parentData))
    .catch(err => {
      console.error("key err", soul, keyInParent, err.stack || err);
      return false;
    })
    .then(res => {
      if (!res) {
        delete parentData[keyInParent];
        delete (path(["_", ">"], parentData) || {})[keyInParent];
        console.error("sea prop err", soul, keyInParent, result, pSchema);
        return res;
      }
      return Promise.resolve(validate()).then(isValid => {
        if (!isValid)
          console.error(
            "sea validation err",
            soul,
            keyInParent,
            result,
            validate.errors,
            pSchema
          );
        return isValid;
      });
    });
};

function sha256hash(mm) {
  const m = parse(mm);
  const h = require("crypto").createHash("sha256");
  h.update(new TextEncoder().encode(m));
  return Promise.resolve(Buffer.from(h.digest(), "utf8"));
}

function parse(props) {
  try {
    if (props.slice && "SEA{" === props.slice(0, 4)) props = props.slice(3);
    return props.slice ? JSON.parse(props) : props;
  } catch (e) {
    return props;
  }
}

const keyCache = {};
const privKeyCache = {};
function toKey(pub, priv) {
  if (keyCache[pub] && !priv) return keyCache[pub];
  if (privKeyCache[pub] && priv) return privKeyCache[pub];
  const [x, y] = pub.split(".");
  const jwk = { kty: "EC", crv: "P-256", x, y, ext: true };
  jwk.key_opts = priv ? ["sign"] : ["verify"];
  if (priv) jwk.d = priv;
  const promise = ossl.importKey("jwk", jwk, pairConf, false, ["verify"]);
  if (priv) privKeyCache[pub] = promise;
  if (!priv) keyCache[pub] = promise;
  return promise;
}

function verify(data, pair, opt) {
  const { encodings = ["base64", "utf8"] } = opt || {};
  const json = parse(data);
  if (false === pair) {
    const raw = json && json.s && json.m ? parse(json.m) : json;
    return Promise.resolve(raw);
  }
  if (!json.s) return Promise.reject(new Error("No signature on data."));
  return Promise.all([toKey(pair.pub || pair), sha256hash(json.m)]).then(
    ([key, hash]) => {
      const encodingsToTry = encodings.slice().reverse();
      const hashArray = new Uint8Array(hash);
      return (function tryNextEncoding(e) {
        e && console.log("error", e.stack || e);
        const encoding = encodingsToTry.pop();
        if (!encoding)
          return Promise.reject(new Error("Signature did not match"));
        const sig = new Uint8Array(Buffer.from(json.s, encoding));
        return ossl
          .verify(signConf, key, sig, hashArray)
          .then(res => (res ? res : tryNextEncoding()), tryNextEncoding);
      })().then(check => (check ? parse(json.m) : undefined));
    }
  );
}

function unpack(data, key, node) {
  if (typeof data === "undefined") return;
  const soul = path(["_", "#"], node);
  const s = path(["_", ">", key], node);
  if (
    data &&
    data.length === 4 &&
    soul === data[0] &&
    key === data[1] &&
    s === data[3]
  )
    return data[2];
  if (s < SHUF_DATE) return data;
}

const read = (data, key, pair = false) =>
  verify(data[key], pair).then(r => {
    if (typeof r === "undefined") {
      throw "invalid sea data";
    }
    return unpack(r, key, data);
  });

module.exports = {
  AUTH_SCHEMA,
  PERMISSIVE_NODE_SCHEMA,
  PERMISSIVE_SCHEMA,
  parse,
  read,
  verify,
  unpack,
  initAjv
};
