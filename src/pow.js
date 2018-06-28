/* globals Promise */
import WorkProofer from "./pow.worker.js";
import { pow, DEFAULT_POW_COMPLEXITY } from "notabug-peer";

export const doWork = (prefix, complexity=DEFAULT_POW_COMPLEXITY) => {
  let terminate;
  const promise = new Promise((resolve, reject) => {
    const worker = new WorkProofer();
    terminate = () => {
      reject(worker.terminate());
    };
    worker.onmessage = (m) => {
      resolve(m.data);
      worker.terminate();
    };
    worker.postMessage([prefix, complexity]);
  });
  promise.terminate = terminate;
  return promise;
};

export const verifyWork = (prefix, nonce, complexity=DEFAULT_POW_COMPLEXITY) => {
  const verifier = new pow.Verifier({
    size: 1024,
    n: 16,
    complexity,
    prefix,
    validity: Infinity
  });

  nonce = Buffer.hasOwnProperty("from") ?
    Buffer.from(nonce, "hex") : new Buffer(nonce, "hex");

  return verifier.check(nonce, complexity);
};
