import commandLineArgs from "command-line-args";
import blocked from "./blocked";
const Gun = require("gun/gun");

const options = commandLineArgs([
  { name: "persist", alias: "P", type: Boolean, defaultValue: false },
  { name: "redis", alias: "r", type: Boolean, defaultValue: false },
  { name: "localStorage", alias: "l", type: Boolean, defaultValue: false },
  { name: "disableValidation", alias: "D", type: Boolean, defaultValue: false },
  { name: "score", alias: "s", type: Boolean, defaultValue: false },
  { name: "json6", alias: "j", type: Boolean }, // TODO: gun-file is broken do not use
  { name: "evict", alias: "e", type: Boolean, defaultValue: false },
  { name: "debug", alias: "d", type: Boolean, defaultValue: false },
  { name: "days", alias: "t", type: Number, defaultValue: 1 },
  { name: "port", alias: "p", type: Number, defaultValue: null },
  { name: "host", alias: "h", type: String, defaultValue: "127.0.0.1" },
  { name: "peer", alias: "c", multiple: true, type: String },
  { name: "until", alias: "u", multiple: true, type: Number, defaultValue: 1000 },
  { name: "watch", alias: "i", type: Boolean, defaultValue: false },
  { name: "listings", alias: "v", type: Boolean, defaultValue: false },
  { name: "index", alias: "w", type: Boolean, defaultValue: false }
]);

process.env.GUN_ENV = process.env.GUN_ENV || options.debug ? "debug" : undefined;
require("gun/nts");
require("gun/lib/store");
require("gun/lib/rs3");
require("gun/lib/wire");
require("gun/lib/verify");
require("gun/lib/then");
//require("gun/sea");

if (!options.persist && !options.redis && options.json6) {
  require("gun-file");
} else if (options.redis) {
  require("./gun-redis");
} else if (options.localStorage) {
  require("gun/lib/file");
}

Gun.on("opt", function(root){
  this.to.next(root);
  if(root.once){ return; }
  root.opt.super = true;
});

if (options.evict) require("gun/lib/evict");
if (options.debug) require("gun/lib/debug");

global.Gun = Gun;

const init = require("notabug-peer").default;
const { initServer } = require("./http");
let nab;

const peerOptions = {
  blocked,
  localStorage: options.localStorage,
  peers: options.peer,
  persist: options.persist,
  disableValidation: options.disableValidation,
  until: options.until,
  scoreThingsForPeers: options.score,
  super: true
};

if (options.port) {
  nab = initServer({
    ...peerOptions,
    redis: options.redis,
    host: options.host,
    port: options.port,
  });
} else {
  nab = init(peerOptions);
}

if (options.watch) {
  nab.watchListing({ days: options.days });
  setInterval(() => nab.watchListing({ days: options.days }), 1000*60*60);
}

if (options.index) {
  const indexed = {};
  nab.gun.get("nab/things").map().once(function ({ id }) {
    if (!options.index || !id || indexed[id]) return;
    indexed[id] = true;
    this.get("data").once(data => data && nab.indexThing(id, data));
  });
}
