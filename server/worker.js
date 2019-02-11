/* globals Promise */
import * as R from "ramda";
import Queue from "bee-queue";
import { createClient } from "redis";
import { scope } from "gun-scope";
import { oracleState, createWorker } from "gun-cleric-bee-queue";
import indexerOracle from "./oracles/indexer";
import spaceIndexerOracle from "./oracles/space-indexer";
import tabulatorOracle from "./oracles/tabulator";

const DEFAULT_GET_THROTTLE = 1000 * 60;
const redis = createClient({ db: 1 });
const state = oracleState({ db: 2 });
const allOracles = [indexerOracle, tabulatorOracle, spaceIndexerOracle];
const getOrcAndRoute = soul =>
  R.compose(
    R.defaultTo([null, null]),
    R.find(R.prop(1)),
    R.map(
      R.compose(
        R.ap([
          R.identity,
          R.compose(
            R.applyTo(soul),
            R.prop("getRoute")
          )
        ]),
        R.of
      )
    )
  )(allOracles);

const processMsgJob = job =>
  new Promise((ok, fail) => {
    try {
      const { soul, type, diff, latest } = job.data || {};

      if (type === "put") {
        allOracles.forEach(orc => orc.onSoulModified(soul, diff, latest));
        return ok();
      }

      const [orc, route] = getOrcAndRoute(soul);
      if (!route || !orc) return ok();
      return Promise.resolve(route.onGet(orc, route, job.data)).then(ok);
    } catch (e) {
      return fail(e);
    }
  });

function createMsgWorker(config = {}) {
  const throttle = config.throttle || DEFAULT_GET_THROTTLE;
  const queue =
    config.queue ||
    new Queue("gun-msgqueue", {
      removeOnSuccess: true,
      removeOnFailure: true,
      ...config
    });
  const onChange = (soul, diff) =>
    queue.createJob({ type: "put", soul, diff }).save();
  const onMsg = msg => {
    const souls = R.without(["#"], R.keys(msg.get));
    const single = R.path(["get", "#"], msg);
    const now = new Date().getTime();

    if (single) souls.push(single);
    souls.forEach(soul =>
      state.timestamp(soul).then(latest => {
        if (now - latest > throttle)
          queue.createJob({ type: "get", soul }).save();
      })
    );
  };

  return { onMsg, onChange, process: (...args) => queue.process(...args) };
}

function setupOracles(nab, activeOracles) {
  const { username, password } = require("../server-config.json");

  return nab.login(username, password).then(({ pub }) => {
    console.log("logged in as", username, pub);
    allOracles.forEach(oracle => {
      const isWorker = activeOracles.includes(oracle);
      const worker = createWorker(oracle, { redis, isWorker });
      const getter = soul => {
        nab.msgWorker.onMsg({ get: { "#": soul } });
        return nab.gun.redis.read(soul);
      };
      oracle.config({
        pub,
        state,
        worker,
        write: (soul, node) => nab.gun.get(soul).put(node),
        newScope: () =>
          scope({
            gun: nab.gun,
            noGun: true,
            getter
          })
      });
      if (isWorker) worker.process();
    });
  });
}

export function init(Gun, nab, options) {
  const active = [
    ...(options.listings ? [indexerOracle] : []),
    ...(options.tabulate ? [tabulatorOracle] : []),
    ...(options.spaces ? [spaceIndexerOracle] : [])
  ];
  const isWorker = active.length > 0;
  const msgWorker = (nab.msgWorker = createMsgWorker({ redis, isWorker }));

  if (options.workers) {
    if (nab.receiver) {
      nab.receiver.onIn(msg => {
        if (msg.fromCluster) return msg;
        msgWorker.onMsg(msg.json);
        return msg;
      });
    } else {
      nab.gun.on("in", msgWorker.onMsg);
    }
  }

  Gun.redis.onChange(msgWorker.onChange);
  if (isWorker)
    setupOracles(nab, active).then(() => msgWorker.process(processMsgJob));
}
