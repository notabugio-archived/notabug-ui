/* globals Gun */
import { keys } from "ramda";
import { validateWireInput } from "./json-schema-validation";
import { queries, newScope } from "./listings";
import * as write from "./write";
import * as auth from "./auth";
export * from "./constants";

export default function notabug(config = {}) {
  const { leech, disableValidation, noGun, localStorage, persist, ...rest } =
    config || {};
  const peer = { config };

  if (!noGun) {
    const cfg = { localStorage: !!localStorage, radisk: !!persist, ...rest };
    if (persist) cfg.localStorage = false;
    if (!disableValidation) Gun.on("opt", ctx => validateWireInput(peer, ctx));
    if (cfg.storeFn) cfg.store = cfg.storeFn(cfg); // for indexeddb
    peer.gun = Gun(cfg);
    if (cfg.localStorage) peer.gun.on("localStorage:error", a => a.retry({}));
    if (leech) {
      // Gun doesn't tell when it reconnects so have to do this lameness:
      const sendLeech = () => peer.gun._.on("out", { leech: true });
      // setInterval(sendLeech, 5*60*1000);
      sendLeech();
    }
  }

  const fns = { queries, newScope, ...write, ...auth };
  keys(fns).map(key => (peer[key] = fns[key](peer)));
  return peer;
}
