#!/usr/bin/env node
var Gun = require("gun/gun");
//require("./src/sea");
var commandLineArgs = require("command-line-args");
var blocked = require("./blocked");

var options = commandLineArgs([
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
  { name: "index", alias: "w", type: Boolean, defaultValue: false }
]);

process.env.GUN_ENV = process.env.GUN_ENV || options.debug ? "debug" : undefined;
Gun.serve = require("gun/lib/serve");
require("gun/nts");
require("gun/lib/store");
require("gun/lib/rs3");
//try{require('./ws');}catch(e){require('./wsp/server');}
require("gun/lib/wire");
require("gun/lib/verify");

if (!options.persist && !options.redis && options.json6) {
  console.log("gun-file");
  require("gun-file");
} else if (options.redis) {
  require("./gun-redis");
} else {
  require("gun/lib/file");
}

require("gun/lib/bye");
Gun.on("opt", function(root){
  this.to.next(root);
  if(root.once){ return; }
  root.opt.super = true;
});
if (options.evict) require("gun/lib/evict");
if (options.debug) require("gun/lib/debug");

global.Gun = Gun;
require("babel-core/register");
require("babel-polyfill");
var path = require("path");
var express = require("express");
var router = express.Router();
var init = require("notabug-peer").default;
var web;
var nab;

if (options.port) {
  var expresStaticGzip = require("express-static-gzip");
  var app = express();
  var listings;
  var cache = require("express-redis-cache")({
    client: require("redis").createClient({ db: 1 }),
    expire: 30
  });

  if (options.redis) {
    listings = require("./redis-listings");
  }

  app.get("/api/topics/:topic.json", cache.route({ expire: 60 }), function (req, res) {
    if (options.redis) {
      listings.listingMeta(nab, req, res);
    } else {
      res.send(nab.getListingJson({ topics: [req.params.topic], sort: "new", days: 30 }));
    }
  });

  app.get("/api/submissions/:opId.json", cache.route({ expire: 30 }), function (req, res) {
    if (options.redis) {
      listings.listingMeta(nab, req, res);
    } else {
      res.send(nab.getListingJson({ opId: req.params.id, sort: "new" }));
    }
  });

  app.get("/api/things/:id.json", cache.route({ expire: 60*60 }), function (req, res) {
    if (options.redis) {
      listings.things(nab, req, res);
    } else {
      res.send({});
    }
  });

  router.use(cache.route({ expire: 60*60 }), expresStaticGzip(path.join(__dirname, "build")));
  app.use(router);

  app.get("/*", cache.route({ expire: 60 }), function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  web = app.listen(options.port, options.host);
}

nab = init({
  blocked,
  localStorage: options.localStorage,
  peers: options.peer,
  persist: options.persist,
  disableValidation: options.disableValidation,
  scoreThingsForPeers: options.score && !options.redis,
  until: options.until,
  super: true,
  web
});

if (options.score && options.redis) {
  nab.onMsg(function(msg) {
    Object.keys(msg).forEach(function(key) {
      if (key === "put" && msg.mesh && msg.how !== "mem") {
        Object.keys(msg.put).forEach(function(soul) {
          var votesMatch = (
            nab.souls.thingVotes.isMatch(soul) ||
            nab.souls.thingAllComments.isMatch(soul)
          );
          var thingDataMatch = nab.souls.thingData.isMatch(soul);

          if (votesMatch) {
            setTimeout(function() {
              var thingSoul = nab.souls.thing.soul({ thingid: votesMatch.thingid });
              nab.gun.redis.get(soul).then(function(votes) {
                var votecount = Object.keys(votes || { _: null }).length - 1;
                var chain = nab.gun.get(thingSoul);
                chain.get(`votes${votesMatch.votekind || "comment"}count`).put(votecount);
                chain.off();
              });
            }, 200);
          } else if (thingDataMatch) {
            setTimeout(function() {
              nab.indexThing(thingDataMatch.thingid, msg.put[soul]);
            }, 200);
          }
        });
      }
    });
  });
}

if (options.watch) {
  nab.watchListing({ days: options.days });
  setInterval(function() {
    nab.watchListing({ days: options.days });
  }, 1000*60*60);
}

if(options.watch || options.index) {
  const indexed = {};
  nab.gun.get("nab/things").map().once(function ({ id }) {
    if (!options.index || !id || indexed[id]) return;
    indexed[id] = true;
    this.get("data").once(function(data) {
      if (!data) return;
      nab.indexThing(id, data);
    });
  });
}
