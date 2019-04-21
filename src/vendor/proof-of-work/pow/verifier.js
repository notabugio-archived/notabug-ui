"use strict";

const utils = require("./utils");
const Bloom = require("./bloom");

const MIN_NONCE_LEN = 8;
const MAX_NONCE_LEN = 32;
const DEFAULT_VALIDITY = 60000;

function Verifier(options) {
  function bloom() {
    return new Bloom(
      options.size,
      options.n,
      (Math.random() * 0x100000000) >>> 0);
  }

  this.blooms = [
    bloom(), bloom()
  ];
  this.complexity = options.complexity;
  this.validity = options.validity || DEFAULT_VALIDITY;
  this.prefix = options.prefix || utils.EMPTY_BUFFER;
}
module.exports = Verifier;

Verifier.prototype.check = function check(nonce, complexity) {
  const prefix = this.prefix;

  if (nonce.length < MIN_NONCE_LEN)
    return false;
  if (nonce.length > MAX_NONCE_LEN)
    return false;

  const ts = utils.readTimestamp(nonce, 0);
  const now = Date.now();

  if (Math.abs(ts - now) > this.validity)
    return false;

  for (var i = 0; i < this.blooms.length; i++)
    if (this.blooms[i].test(nonce))
      return false;

  const hash = utils.hash(nonce, prefix);

  if (!utils.checkComplexity(hash, complexity || this.complexity))
    return false;

  this.blooms[0].add(nonce);
  return true;
};

Verifier.prototype.reset = function reset() {
  this.blooms[1].reset();

  // Swap filters
  const tmp = this.blooms[0];

  this.blooms[0] = this.blooms[1];
  this.blooms[1] = tmp;
};
