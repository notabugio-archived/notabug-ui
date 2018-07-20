/* globals Promise */
import { path, mergeDeepRight } from "ramda";
import init from "notabug-peer";

const RECORD_TIMEOUT = 5000;

const getRecord = (nab, soul, timeout=RECORD_TIMEOUT) => (new Promise((resolve, reject) => {
  nab.gun.redis
    ? nab.gun.redis.get(soul).then(resolve).catch(reject)
    : nab.gun.get(soul).once((data) => resolve(data), { wait: 1 });
  setTimeout(() => reject("record timeout after " + timeout), timeout);
})).catch(error => {
  console.error("getRecord error " + soul, error.stack || error);
  return null;
});

export const calculateListing = (nab, req, routeMatch) => {
  const things = {};
  const result = { timestamp: (new Date()).getTime(), things };
  const opId = req.params.opId || (routeMatch && routeMatch.params.submission_id);
  let params;

  if (opId) {
    params = { opId, sort: "new" };
    result.collectionSoul = nab.souls.thingAllComments.soul({ thingid: opId });
  } else {
    const count = parseInt(req.query.count || 0, 10);
    const topic = req.params.topic || (routeMatch && routeMatch.params.topic) || "all";
    const topics = [topic];
    const sort = req.params.sort || (routeMatch && routeMatch.params.sort) || "hot";
    const days = parseInt(req.query.days || 90, 10);
    const limit = parseInt(req.query.limit || 25, 10);
    const threshold = sort === "new" || sort === "controversial" ? null : 1;
    params = { topics, sort, threshold, days, count, limit };
    result.topic = topic;
  }

  const souls = nab.getListingSouls(params).sort();
  if (!req.query.days) delete params.days;

  const fetchThingSoul = thingSoul => {
    if (thingSoul === "_" || thingSoul === "#") return;
    return Promise.all([
      getRecord(nab, thingSoul),
      getRecord(nab, thingSoul + "/allcomments"),
      getRecord(nab, thingSoul + "/votesup"),
      getRecord(nab, thingSoul + "/votesdown"),
    ]).then(res => {
      if (!res[0] || !res[0].id) return;
      const thing = { timestamp: res[0].timestamp };
      const allcomments = Object.keys(res[1] || { _: null }).length - 1;
      const votesup = Object.keys(res[2] || { _: null }).length - 1;
      const votesdown = Object.keys(res[3] || { _: null }).length - 1;
      const votes = {};
      const replyToSoul = path(["replyTo", "#"], res[0]);
      const opSoul = path(["op", "#"], res[0]);
      const opId = opSoul ? nab.souls.thing.isMatch(opSoul).thingid : null;
      const replyToId = replyToSoul ? nab.souls.thing.isMatch(replyToSoul).thingid : null;

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
  };

  const fetchCollections = () =>
    Promise.all(souls.map(soul => getRecord(nab, soul)))
      .then(collections => {
        const merged = {};
        const fetchNext = () => {
          if (!collections.length) return things;
          if (Object.keys(things).length > 1000 && !opId) return things;
          return Promise.all(Object.keys(collections.pop()).map(fetchThingSoul)).then(fetchNext);
        };

        Object.values(collections || {}).reverse().find(collection => {
          return Object.keys(collection || {}).find(soul => {
            merged[soul] = collection[soul];
            if (!opId && Object.keys(merged).length >= 1000) return true;
          });
        });

        return merged;
      });

  const fetchThings = () => fetchCollections()
    .then(res => res && Promise.all(Object.keys(res).map(fetchThingSoul)));

  const promise = opId
    ? fetchThingSoul(nab.souls.thing.soul({ thingid: opId })).then(fetchThings)
    : fetchThings();

  return promise.then(() => {
    const listingThings = {};
    const tmp = init({ noGun: true, localStorage: false, disableValidation: true });
    tmp.loadState(mergeDeepRight({}, result));
    const ids = tmp.getListingIds(params);
    if (opId) ids.push(opId);
    ids.forEach(id => listingThings[id] = things[id]);
    if (opId || routeMatch) {
      return calculateThings(nab, { params: { id: ids.join(",") } })
        .then(data => ({ ...result, data }));
    } else {
      return result;
    }
  });
};

const calculateThings = (nab, req) => {
  const things = {};
  return Promise.all(req.params.id.split(",").map(id =>
    getRecord(nab, "nab/things/" + id + "/data").then(data => {
      if(!data) return;
      delete data["_"];
      things[id] = data;
    })
  )).then(() => things);
};

const listingMeta = (nab, req, res) => calculateListing(nab, req).then(res.send);
const things = (nab, req, res) => calculateThings(nab, req).then(res.send);
module.exports.listingMeta = listingMeta;
module.exports.things = things;
