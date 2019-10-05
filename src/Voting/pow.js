/* globals Promise */
const DEFAULT_POW_COMPLEXITY = parseInt(process.env.DEFAULT_POW_COMPLEXITYNAB_POW_COMPLEXITY) || 6;

const workers = [];

const stopWorkers = (callback, data) => {
  workers.forEach(worker => (worker.onmessage = undefined));
  if (callback) callback(data);
};

const pow = (numCores, prefix, complexity, resolve, reject) => {
  stopWorkers();
  for (let i = workers.length; i < numCores; ++i)
    workers.push(new Worker("./pow.worker.js"));

  workers.slice(0, numCores).forEach(worker => {
    worker.onmessage = m => {
      if (!m.data) return worker.postMessage([prefix, complexity]);

      if (m.data[0] == prefix) stopWorkers(resolve, m.data[1]);
    };
    worker.postMessage([prefix, complexity]);
  });

  return () => stopWorkers(reject);
};

export const doWork = (
  prefix,
  numCores = 1,
  complexity = DEFAULT_POW_COMPLEXITY
) => {
  let terminate;
  const promise = new Promise(
    (resolve, reject) =>
      (terminate = pow(numCores, prefix, complexity, resolve, reject))
  );

  promise.terminate = terminate;
  return promise;
};
