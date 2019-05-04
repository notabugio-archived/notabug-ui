"use strict";

const assert = require("minimalistic-assert");

exports.checkComplexity = function checkComplexity(hash, complexity) {
  assert(complexity < hash.length * 8, "Complexity is too high");

  var off = 0;
  var i;

  for (i = 0; i <= complexity - 8; i += 8, off++) {
    if (hash[off] !== 0)
      return false;
  }

  const mask = 0xff << (8 + i - complexity);

  return (hash[off] & mask) === 0;
};
