import * as R from "ramda";
import commandLineArgs from "command-line-args";
import { Schema, Config } from "@notabug/peer";
import { owner, tabulator, indexer } from "/config";

Config.update({ owner, tabulator, indexer });
const Gun = (global.Gun = require("gun/sea").Gun);

let nab;
const options = commandLineArgs([
  { name: "dev", type: Boolean, defaultValue: false },
  { name: "persist", alias: "P", type: Boolean, defaultValue: false },
  { name: "redis", alias: "r", type: Boolean, defaultValue: false },
  { name: "disableValidation", alias: "D", type: Boolean, defaultValue: false },
  { name: "evict", alias: "e", type: Boolean, defaultValue: false },
  { name: "debug", alias: "d", type: Boolean, defaultValue: false },
  { name: "render", alias: "z", type: Boolean, defaultValue: false },
  { name: "port", alias: "p", type: Number, defaultValue: null },
  { name: "pistol", alias: "i", type: Boolean, defaultValue: false },
  { name: "host", alias: "h", type: String, defaultValue: "127.0.0.1" },
  { name: "peer", multiple: true, type: String },
  { name: "leech", type: Boolean, defaultValue: false },
  { name: "until", alias: "u", type: Number, defaultValue: 1000 },
  { name: "index", type: Boolean, defaultValue: false },
  { name: "backindex", type: Boolean, defaultValue: false },
  { name: "listings", alias: "v", type: Boolean, defaultValue: false },
  { name: "spaces", alias: "s", type: Boolean, defaultValue: false },
  { name: "tabulate", alias: "t", type: Boolean, defaultValue: false },
  { name: "comments", alias: "c", type: Boolean, defaultValue: false }
]);

const peerOptions = {
  ...R.pick(["localStorage", "persist", "disableValidation", "until"], options),
  peers: options.peer || [],
  gc_info_enable: options.debug,
  super: !options.leech
};

process.env.GUN_ENV = options.debug ? "debug" : undefined;
require("gun/lib/not");
require("gun/nts");
require("gun/lib/store");
require("gun/lib/rs3");
require("gun/lib/wire");
require("gun/lib/verify");
require("gun/lib/then");
if (options.evict) require("gun/lib/les");
if (options.debug) require("gun/lib/debug");
if (options.redis) require("@notabug/gun-redis").attachToGun(Gun);

if (options.port) {
  nab = require("./http").initServer({
    ...peerOptions,
    ...R.pick(["pistol", "render", "redis", "host", "port", "dev"], options)
  });
} else {
  nab = require("@notabug/peer").default(Gun, peerOptions);
  nab.gun.get("~@").once(() => null);
}

if (options.redis) nab.gun.redis = Gun.redis;

if (options.index || options.tabulate || options.backindex) {
  const { username, password } = require("../../server-config.json");

  nab.login(username, password).then(() => {
    let scopeParams;

    if (options.redis)
      scopeParams = {
        noGun: true,
        getter: soul => {
          // nab.gun.get(soul).on(R.identity);
          return nab.gun.redis.read(soul);
        }
      };

    if (options.index) nab.index(scopeParams);
    if (options.tabulate) nab.tabulate(scopeParams);
    if (options.backindex) {
      nab.tabulate(scopeParams);
      nab.index(scopeParams);

      const indexThingSet = obj => {
        const keys = R.keysIn(obj);

        console.log("got obj", keys.length);
        keys.forEach(soul => {
          const thingId = R.propOr(
            "",
            "thingId",
            Schema.Thing.route.match(soul)
          );

          if (!thingId) return;
          nab.oracle().features.forEach(feature => feature.enqueue(thingId));
        });
      };

      nab.gun.get("nab/topics/all/days/2019/4/27").once(obj => {
        indexThingSet(obj);
        nab.gun.get("nab/topics/comments:all/days/2019/4/27").once(obj => {
          indexThingSet(obj);
        });
        nab.gun.get("nab/topics/chat:all/days/2019/4/27").once(obj => {
          indexThingSet(obj);
        });
      });
    }
  });
}
