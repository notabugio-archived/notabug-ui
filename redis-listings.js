/* globals Promise */
var _ = require("ramda");

function calculateListing(nab, req) {
  var things = {};
  var data;
  var params;

  if (req.params.topic) {
    params = { topics: [req.params.topic], sort: "new", days: 90 };
  } else if (req.params.opId) {
    params = { opId: req.params.opId, sort: "new" };
  }

  var souls = nab.getListingSouls(params).sort();
  nab.watchListing(params);

  const fetchSoul = () => {
    const soul = souls.pop();
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
  };

  const fetchItems = () => {
    if (souls.length && (params.opId || Object.keys(things).length < 1000)) {
      return fetchSoul().then(fetchItems);
    }

    return Promise.resolve(things);
  };

  return fetchItems().then(function() {
    if (req.params.opId) {
      return calculateThings(nab, { params: { id: Object.keys(things).join(",") } })
        .then(result => data = result);
    }
  }).then(function() {
    var result = { timestamp: (new Date()).getTime(), things: things };
    if (data) result.data = data;
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
  calculateListing(nab, req).then(function(result) {
    res.send(result);
  });
}

function things(nab, req, res) {
  calculateThings(nab, req).then(function(result) {
    res.send(result);
  });
}

module.exports.listingMeta = listingMeta;
module.exports.things = things;
