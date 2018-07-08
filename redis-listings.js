/* globals Promise */

const FRESH = 1000 * 60 * 1;

function calculateListing(nab, req) {
  var things = {};
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
          nab.gun.redis.get(thingSoul + "/comments"),
          nab.gun.redis.get(thingSoul + "/votesup"),
          nab.gun.redis.get(thingSoul + "/votesdown"),
        ]).then(function(res) {
          if (!res[0] || !res[0].id) return;
          var thing = { timestamp: res[0].timestamp };
          var allcomments = Object.keys(res[1] || { _: null }).length - 1;
          var votesup = Object.keys(res[2] || { _: null }).length - 1;
          var votesdown = Object.keys(res[3] || { _: null }).length - 1;
          var votes = {};

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
    var result = { timestamp: (new Date()).getTime(), things: things };

    if (Object.keys(things).length) {
      nab.gun.redis.put(req.url, result, function(err) {
        err && console.error("error putting", err);
      });
    }

    return result;
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

module.exports.listingMeta = listingMeta;
