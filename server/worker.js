import * as R from "ramda";
import Queue from "bee-queue";
import { createClient } from "redis";
import { scope } from "gun-scope";
import { oracleState, createWorker } from "gun-cleric-bee-queue";
import { Listing } from "notabug-peer";
import { tabulator, indexer, comments, spaces } from "./oracles";

const createIndexer = R.always({
  update: (soul, ...args) => Listing.ListingNode.diff(...args)
});

const DEFAULT_GET_THROTTLE = 1000 * 60;
const redis = createClient({ db: 1 });
const state = oracleState({ db: 2 });
const allOracles = [indexer, tabulator, spaces, comments];
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
      const { soul, type, diff, original, latest } = job.data || {};

      if (type === "put") {
        allOracles.forEach(orc =>
          orc.onSoulModified(soul, diff, original, latest)
        );
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
  const onChange = (soul, diff, original) =>
    queue.createJob({ type: "put", soul, diff, original }).save();
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
      const indexer = createIndexer();
      const getter = soul => {
        // nab.gun.get(soul).on(R.identity);
        return nab.gun.redis
          .read(soul)
          .finally(() => nab.msgWorker.onMsg({ get: { "#": soul } }));
      };

      oracle.config({
        pub,
        state,
        worker,
        indexer,
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
    ...(options.listings ? [indexer] : []),
    ...(options.comments ? [comments] : []),
    ...(options.tabulate ? [tabulator] : []),
    ...(options.spaces ? [spaces] : [])
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
