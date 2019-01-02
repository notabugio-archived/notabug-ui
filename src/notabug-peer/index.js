/* globals Gun */
import { assoc } from "ramda";
import * as write from "./write";
import * as schema from "./schema";
import { validateWireInput } from "./validation";
import * as auth from "./auth";
import { queries, newScope } from "./listings";
export * from "./util";
export * from "./constants";
export { nowOr, now } from "./scope";

const DEFAULT_PEERS = [];

export default function notabug(config={}) {
  const {
    peers=DEFAULT_PEERS, blocked=[], noGun=false, localStorage=false,
    persist=false, ...rest
  } = config || {};
  const blockedMap = blocked.reduce((res, soul) => ({ ...res, [soul]: true }), {});
  const peer = {
    config,
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
  peer.souls = peer.schema = Object.keys(schema).reduce((res, key) => assoc(key, schema[key](peer), res), {});

  if (!noGun) {
    Gun.on("opt", context => {
      /*context.on("out", function wireOutput(msg) {
        if (msg && msg.err && msg.err === "Error: Invalid graph!") return;
        if (!msg || !(msg.put || msg.get)) return;
        this.to.next(msg);
      });*/
      validateWireInput(peer, context);
    });

    // for indexeddb
    if (gunConfig.storeFn) gunConfig.store = gunConfig.storeFn(gunConfig);

    peer.gun = Gun(gunConfig);
    // Nuke gun's localStorage if it fills up, kinda lame but less lame than total failure
    if (!persist && localStorage) peer.gun.on("localStorage:error", ack => ack.retry({}));
    blocked.forEach(soul => peer.gun.get(soul).put({ url: null, body: "[removed]", title: "[removed]" }));
    if (config.leech) peer.gun._.on("out", { leech: true });
    if (config.oracle) peer.gun.on("put", msg => config.oracle.onPut(peer, msg));
  }

  const fns = { queries, newScope, ...write, ...auth };
  Object.keys(fns).map(key => peer[key] = fns[key](peer));
  return peer;
}
