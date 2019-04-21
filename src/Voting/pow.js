/* globals Promise */
import { complexity as DEFAULT_POW_COMPLEXITY } from "/work-config.json";

let worker;

export const doWork = (prefix, complexity = DEFAULT_POW_COMPLEXITY) => {
  let terminate;
  const promise = new Promise((resolve, reject) => {
    worker = worker || new Worker("./pow.worker.js");
    terminate = () => {
      reject(worker.terminate());
      worker = null;
    };
    worker.onmessage = m => resolve(m.data);
    worker.postMessage([prefix, complexity]);
  });

  promise.terminate = terminate;
  return promise;
};
