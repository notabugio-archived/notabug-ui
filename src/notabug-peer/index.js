/* globals Gun */
import { assoc } from "ramda";
import { ZalgoPromise as Promise } from "zalgo-promise";
import * as write from "./write";
import * as souls from "./souls";
import * as schema from "./schema";
import * as auth from "./auth";
import * as listings from "./listings";
export * from "./util";
export { default as pow } from "proof-of-work";
export { nowOr, now } from "./scope";

const DEFAULT_PEERS = [];

export default function notabug(config={}) {
  const {
    peers=DEFAULT_PEERS, disableValidation, blocked=[], noGun=false, localStorage=false,
    persist=false, ...rest
  } = config || {};
  const blockedMap = blocked.reduce((res, soul) => ({ ...res, [soul]: true }), {});
  const peer = {
    config,
    schema,
    isBlocked: soul => !!blockedMap[soul],
  };
  const gunConfig = { peers, localStorage, ...rest };
  if (persist) {
    gunConfig.localStorage = false;
    gunConfig.radisk = true;
    gunConfig.until = gunConfig.until || 1000;
  } else {
    gunConfig.radisk = false;
  }
  peer.souls = Object.keys(souls).reduce((res, key) => assoc(key, souls[key](peer), res), {});

  if (!noGun) {
    Gun.on("opt", context => {
      context.on("out", function wireOutput(msg) {
        if (msg && msg.err && msg.err === "Error: Invalid graph!") return;
        if (!msg || !(msg.put || msg.get)) return;
        this.to.next(msg);
      });
      context.on("in", function wireInput(msg) {
        if (msg && msg.err && msg.err === "Error: Invalid graph!") return;
        if (!msg || !(msg.put || msg.get)) return;
        Promise.all(Object.keys(msg || {}).map(key => {
          if (key === "put" && msg.mesh) {
            const validated = msg;
            Object.keys(validated.put || {}).forEach(putKey => {
              validated.put[putKey] = config.putMutate
                ? config.putMutate(msg.put[putKey], putKey)
                : validated.put[putKey];
            });
            if (!disableValidation) {
              return Promise
                .resolve(peer.schema.types(key, validated[key], validated, null, validated, peer));
            }
          }
          return Promise.resolve(msg);
        }))
          .then(() => {
            if (msg && msg.put && !Object.keys(msg.put).length) return; // Rejected all writes
            try {
              if (config.oracle && msg.get) config.oracle.onGet(peer, msg);
            } catch(e) {
              console.error("wtf", e);
            }
            if (config.leech && msg.mesh && msg.get) return; // ignore gets
            this.to.next(msg);
          })
          .catch(e => console.error("Message rejected", e.stack || e, msg)); // eslint-disable-line
      });
    });
    peer.gun = Gun(gunConfig);
    // Nuke gun's localStorage if it fills up, kinda lame but less lame than total failure
    if (!persist && localStorage) peer.gun.on("localStorage:error", ack => ack.retry({}));
    blocked.forEach(soul => peer.gun.get(soul).put({ url: null, body: "[removed]", title: "[removed]" }));
    if (config.oracle) peer.gun.on("put", msg => config.oracle.onPut(peer, msg));
  }

  const fns = { ...listings, ...write, ...auth };
  Object.keys(fns).map(key => peer[key] = fns[key](peer));
  return peer;
}
