import isNode from "detect-node";
import { ZalgoPromise as Promise } from "zalgo-promise";
import {
  hashLength, timeCost, memoryCost, parallelism, complexity as DEFAULT_POW_COMPLEXITY
} from "../work-config.json";

const MIN_NONCE_LEN = 8;
const MAX_NONCE_LEN = 32;

let argon2;

export const argon2Hash = (prefix, nonce) => {
  if (isNode) {
    var salt = Buffer.hasOwnProperty("from") ?
      Buffer.from(nonce, "hex") : new Buffer(nonce, "hex");

    argon2 = argon2 || require("argon2");
    return argon2.hash(prefix, {
      salt,
      hashLength,
      timeCost,
      memoryCost,
      parallelism,
      raw: true,
      type: argon2.argon2d
    });
  } /* else {
    return require("argon2-browser")
      .hash({ pass: prefix, salt, distPath: "/static/js" })
      .then(res => res.hash);
  } */
};

export const verifyWork = (prefix, nonce, complexity=DEFAULT_POW_COMPLEXITY) => {
  nonce = Buffer.hasOwnProperty("from") ?
    Buffer.from(nonce, "hex") : new Buffer(nonce, "hex");

  if (nonce.length < MIN_NONCE_LEN) return Promise.resolve(false);
  if (nonce.length > MAX_NONCE_LEN) return Promise.resolve(false);

  return argon2Hash(prefix, nonce)
    .then(hash => {
      var off = 0;
      var i;
      for (i = 0; i <= complexity - 8; i += 8, off++) {
        if (hash[off] !== 0)
          return false;
      }

      const mask = 0xff << (8 + i - complexity);
      return (hash[off] & mask) === 0;
    })
    .catch(error => {
      console.error(error.stack || error);
      return false;
    });
};
