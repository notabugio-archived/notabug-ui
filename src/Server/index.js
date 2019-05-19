import * as R from "ramda";
import { ThingSet, Config, Schema } from "@notabug/peer";
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
if (options.openstack) {
  const openStackOpts = {
    url: options.openstack
  };
  require("@notabug/gun-openstack-swift").attachToGun(Gun, openStackOpts);
}
if (options.lmdb)
  require("@notabug/gun-lmdb").attachToGun(Gun, {
    path: options.lmdbpath,
    mapSize: options.lmdbmapsize
  });

if (options.port) {
  nab = require("./http").initServer({
    ...peerOptions,
    ...R.pick(
      ["pistol", "render", "redis", "lmdb", "host", "port", "dev"],
      options
    )
  });
} else {
  nab = require("@notabug/peer").default(Gun, peerOptions);
  nab.gun.get("~@").once(() => null);
}

if (options.redis) nab.gun.redis = Gun.redis;
if (options.lmdb) nab.gun.lmdb = Gun.lmdb;

if (options.sync) nab.synchronize();
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

    if (options.backindex) {
      nab.index(scopeParams);
      nab.tabulate(scopeParams);

      const dayStr = ""; // "/days/" + ThingSet.dayStr();
      const souls = [
        "nab/topics/all",
        "nab/topics/comments:all",
        "nab/topics/chat:all"
      ].map(soul => soul + dayStr);
      const features = nab.oracle().features;

      souls.forEach(soul =>
        nab.gun.get(soul).once(node => {
          const souls = R.keys(node);
          souls.forEach(soul => {
            const thingId = R.propOr(
              "",
              "thingId",
              Schema.Thing.route.match(soul)
            );
            if (!thingId) return;
            features.forEach(feature => feature.enqueue(thingId));
          });
        })
      );
    } else {
      if (options.index) nab.index(scopeParams);
      if (options.tabulate) nab.tabulate(scopeParams);
    }
  });
}
