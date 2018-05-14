import Promise from "promise";

export const PREFIX = "nab";
export const promisify = fn => (...args) => fn(...args,
  (ack) => new Promise((ok, fail) => ack.err ? fail(ack.err) : ok(ack.ok)));
