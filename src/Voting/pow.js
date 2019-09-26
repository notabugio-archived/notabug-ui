/* globals Promise */
import { complexity as DEFAULT_POW_COMPLEXITY } from "/work-config.json"

const workers = []

function pow(numCores, prefix, complexity, resolve, reject) {
  for(let i = workers.length; i < numCores; ++i)
    workers.push(new Worker("./pow.worker.js"))

  workers.slice(0, numCores).forEach(worker => {
    worker.onmessage = m => {
      if(m.data[0]) {
        workers.forEach(worker => worker.onmessage = undefined)
        resolve(m.data[1])
      }
      else {
        worker.postMessage([prefix, complexity])
      }
    }
    worker.postMessage([prefix, complexity])
  })

  return () => {
    workers.forEach(worker => worker.onmessage = undefined)
    if(reject)
      reject()
  }
}

export const doWork = (prefix, numCores = 1, complexity = DEFAULT_POW_COMPLEXITY) => {
  let terminate
  const promise = new Promise((resolve, reject) =>
    terminate = pow(numCores, prefix, complexity, resolve, reject))

  promise.terminate = terminate
  return promise
}
