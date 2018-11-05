/* globals Promise */
import WorkProofer from "./pow.worker.js";
import { complexity as DEFAULT_POW_COMPLEXITY } from "work-config.json";

let worker;

export const doWork = (prefix, complexity=DEFAULT_POW_COMPLEXITY) => {
  let terminate;
  const promise = new Promise((resolve, reject) => {
    worker = worker || new WorkProofer();
    terminate = () => {
      reject(worker.terminate());
    };
    worker.onmessage = (m) => resolve(m.data);
    worker.postMessage([prefix, complexity]);
  });
  promise.terminate = terminate;
  return promise;
};
