"use strict";
import { argon2 } from "argon2-browser";
if (!require("detect-node")) {
  // const argon2 = require("/vendor/argon2-browser");
  const hashLength = parseInt(process.env.NAB_POW_HASH_LENGTH) || 32;
  const timeCost = parseInt(process.env.NAB_POW_TIME_COST) || 1;
  const memoryCost = parseInt(process.env.NAB_POW_MEMORY_COST) || 10240;
  const parallelism = parseInt(process.env.NAB_POW_PARALLELISM) || 1;

  const distPath = "/static/js";

  argon2.load &&
    argon2
      .load({ distPath })
      .catch(error => console.error(error.stack || error));

  module.exports.EMPTY_BUFFER = [];

  module.exports.allocBuffer = function allocBuffer(size) {
    const res = new Array(size);

    for (var i = 0; i < res.length; i++) res[i] = 0;
    return res;
  };

  function readUInt32(buffer, off) {
    return (
      ((buffer[off] << 24) |
        (buffer[off + 1] << 16) |
        (buffer[off + 2] << 8) |
        buffer[off + 3]) >>>
      0
    );
  }

  function writeUInt32(buffer, value, off) {
    buffer[off] = (value >>> 24) & 0xff;
    buffer[off + 1] = (value >>> 16) & 0xff;
    buffer[off + 2] = (value >>> 8) & 0xff;
    buffer[off + 3] = value & 0xff;

    return off + 4;
  }

  module.exports.readUInt32 = readUInt32;
  module.exports.writeUInt32 = writeUInt32;

  module.exports.writeTimestamp = function writeTimestamp(buffer, ts, off) {
    const hi = (ts / 0x100000000) >>> 0;
    const lo = (ts & 0xffffffff) >>> 0;

    off = writeUInt32(buffer, hi, off);
    return writeUInt32(buffer, lo, off);
  };

  module.exports.readTimestamp = function readTimestamp(buffer, off) {
    return readUInt32(buffer, off) * 0x100000000 + readUInt32(buffer, off + 4);
  };

  module.exports.hash = function hash(nonce, prefix) {
    return argon2
      .hash({
        distPath: "/argon2",
        pass: prefix,
        salt: nonce,
        hashLen: hashLength,
        time: timeCost,
        mem: memoryCost,
        parallelism
      })
      .then(res => res.hash);
  };

  module.exports.checkComplexity = require("./common").checkComplexity;
}
