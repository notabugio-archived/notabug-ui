import * as R from "ramda";
import { Schema, Config, ThingSet } from "@notabug/peer";
import { options } from "./options";
import { owner, tabulator, indexer } from "/config";

Config.update({ owner, tabulator, indexer });
const Gun = (global.Gun = require("gun/sea").Gun);

let nab;
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
if (options.lmdb)
  require("@notabug/gun-lmdb").attachToGun(Gun, {
    path: options.lmdbpath,
    mapSize: options.lmdbmapsize
  });

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
if (options.lmdb) nab.gun.lmdb = Gun.lmdb;

if (options.index || options.tabulate || options.backindex) {
  const { username, password } = require("../../server-config.json");

  nab.login(username, password).then(() => {
    let scopeParams;

    if (options.redis)
      scopeParams = {
        noGun: true,
        getter: soul => nab.gun.redis.read(soul)
      };

    if (options.lmdb)
      scopeParams = {
        noGun: true,
        getter: soul => nab.gun.lmdb.read(soul)
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

      const dayStr = ThingSet.dayStr();

      nab.gun.get(`nab/topics/all/days/${dayStr}`).once(obj => {
        indexThingSet(obj);
        nab.gun.get(`nab/topics/comments:all/days/${dayStr}`).once(obj => {
          indexThingSet(obj);
        });
        nab.gun.get(`nab/topics/chat:all/days/${dayStr}`).once(obj => {
          indexThingSet(obj);
        });
      });
    }
  });
}
