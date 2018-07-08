/* globals Promise */
var _ = require("ramda");
var FRESH = 1000 * 60 * 1;

function calculateListing(nab, req) {
  var things = {};
  var data;
  var params;

  if (req.params.topic) {
    params = { topics: [req.params.topic], sort: "new", days: 30 };
  } else if (req.params.opId) {
    params = { opId: req.params.opId, sort: "new", days: 30 };
  }

  var souls = nab.getListingSouls(params);
  nab.watchListing(params);

  return Promise.all(souls.map(function(soul) {
    return nab.gun.redis.get(soul).then(function(res) {
      if (!res) return;
      return Promise.all(Object.keys(res).map(function(thingSoul) {
        if (thingSoul === "_" || thingSoul === "#") return;
        return Promise.all([
          nab.gun.redis.get(thingSoul),
          nab.gun.redis.get(thingSoul + "/allcomments"),
          nab.gun.redis.get(thingSoul + "/votesup"),
          nab.gun.redis.get(thingSoul + "/votesdown"),
        ]).then(function(res) {
          if (!res[0] || !res[0].id) return;
          var thing = { timestamp: res[0].timestamp };
          var allcomments = Object.keys(res[1] || { _: null }).length - 1;
          var votesup = Object.keys(res[2] || { _: null }).length - 1;
          var votesdown = Object.keys(res[3] || { _: null }).length - 1;
          var votes = {};
          var replyToSoul = _.path(["replyTo", "#"], res[0]);
          var opSoul = _.path(["op", "#"], res[0]);
          var opId = opSoul ? nab.souls.thing.isMatch(opSoul).thingid : null;
          var replyToId = replyToSoul ? nab.souls.thing.isMatch(replyToSoul).thingid : null;

          if (opId) thing.opId = opId;
          if (replyToId) thing.replyToId = replyToId;
          if (allcomments) votes.comment = allcomments;
          if (votesup) votes.up = votesup;
          if (votesdown) votes.down = votesdown;

          if (res[0].lastActive && res[0].lastActive !== res[0].timestamp) {
            thing.lastActive = res[0].lastActive;
          }

          if (Object.keys(votes).length) {
            thing.votes = votes;
          }

          things[res[0].id] = thing;
        });
      }));
    });
  })).then(function() {
    if (req.params.opId) {
      return calculateThings(nab, { params: { id: Object.keys(things).join(",") } })
        .then(result => data = result);
    }
  }).then(function() {
    var result = { timestamp: (new Date()).getTime(), things: things };

    if (data) result.data = data;

    if (Object.keys(things).length) {
      nab.gun.redis.put(req.url, result, function(err) {
        err && console.error("error putting", err);
      });
    }

    return result;
  });
}

function calculateThings(nab, req) {
  var things = {};
  var ids = req.params.id.split(",");

  return Promise.all(ids.map(function(id) {
    return nab.gun.redis.get("nab/things/" + id + "/data").then(function(data) {
      if(data) {
        delete data["_"];
        things[id] = data;
      }
    });
  })).then(function() {
    return things;
  });
}

function listingMeta(nab, req, res) {
  nab.gun.redis.get(req.url).then(function(cached) {
    var now = (new Date()).getTime();

    if (cached && cached.things && Object.keys(cached.things).length) {
      Object.values(cached.things || {}).forEach(function(thing) {
        if (thing.timestamp) thing.timestamp = parseInt(thing.timestamp, 10);
        if (thing.lastActive) thing.lastActive = parseInt(thing.lastActive, 10);
        if (thing.votes) {
          Object.keys(thing.votes).forEach(function(kind) {
            thing.votes[kind] = parseInt(thing.votes[kind], 10);
          });
        }
      });

      res.send(cached);

      if ((now - cached.timestamp) > FRESH) {
        calculateListing(nab, req);
      }
    } else {
      calculateListing(nab, req).then(function(result) {
        res.send(result);
      });
    }
  });
}

function things(nab, req, res) {
  calculateThings(nab, req).then(function(result) {
    res.send(result);
  });
}

module.exports.listingMeta = listingMeta;
module.exports.things = things;
