import * as R from "ramda";
import { sorts, thingMeta } from "../queries";
import { LISTING_SIZE } from "./utils";
import { getWikiPage } from "../notabug-peer/listings";
import { needsScores, needsData } from "./datasources";
import { toFilters } from "../notabug-peer/source";
import { routes } from "../notabug-peer/json-schema";
const marky = require("marky");

const getListingIds = R.compose(
  R.split("+"),
  R.propOr("", "ids")
);

const getEdgeIds = R.compose(
  R.filter(R.identity),
  R.map(
    R.compose(
      R.prop("thingId"),
      routes.Thing.match.bind(routes.Thing)
    )
  ),
  R.map(R.prop("#")),
  R.values
);

const groupBySticky = (isSticky, allIds) =>
  R.groupBy(
    R.compose(
      R.ifElse(R.identity, R.always("stickyIds"), R.always("ids")),
      isSticky
    ),
    allIds
  );

const readSEA = rawData => {
  const data = rawData ? { ...rawData } : rawData;
  const soul = R.path(["_", "#"], data);
  if (!soul || !Gun.SEA || soul.indexOf("~") === -1) return rawData;
  R.without(["_"], R.keys(data)).forEach(key => {
    Gun.SEA.verify(
      Gun.SEA.opt.pack(rawData[key], key, rawData, soul),
      false,
      res => (data[key] = Gun.SEA.opt.unpack(res, key, rawData))
    );
  });
  return data;
};

export const binarySearch = async (ids, id, getSortVal) => {
  // based on https://stackoverflow.com/a/29018745
  const insertVal = await getSortVal(id);
  let m = 0;
  let n = ids.length - 1;

  while (m <= n) {
    const k = (n + m) >> 1;
    const compareVal = await getSortVal(ids[k]);

    if (insertVal > compareVal) {
      m = k + 1;
    } else if (insertVal < compareVal) {
      n = k - 1;
    } else {
      return k;
    }
  }
  if (m === 0) return 0;
  return m;
};

export const sortId = async (
  orc,
  route,
  scope,
  sort,
  existingIds,
  thingId,
  listingSource
) => {
  let ids = existingIds.slice();
  let bsIndex;
  const existingIndex = ids.indexOf(thingId);
  const tabulator = `~${orc.pub}`;

  if (existingIndex !== -1) ids.splice(existingIndex, 1);
  if (listingSource) {
    const item = await thingMeta(scope, {
      thingSoul: routes.Thing.reverse({ thingId }),
      tabulator,
      scores: needsScores(listingSource),
      data: needsData(listingSource)
    });
    if (!listingSource.thingFilter(item)) return ids;
  }
  if (!bsIndex)
    bsIndex = await binarySearch(ids, thingId, id =>
      sorts[sort].getValueForId(scope, id, { tabulator })
    );
  if (bsIndex >= LISTING_SIZE) return existingIndex === -1 ? existingIds : ids;
  if (bsIndex === existingIndex || bsIndex === -1) return existingIds;
  console.log("MOVE", sort, route.soul, thingId, existingIndex, bsIndex);
  ids.splice(bsIndex, 0, thingId);
  return ids;
};

export const onPutListingHandler = sort => async (
  orc,
  route,
  { updatedSoul, diff }
) => {
  let nextId;
  let updatedThingIds = [];
  const scope = orc.newScope();
  const voteCountsMatch = routes.ThingVoteCounts.match(updatedSoul);

  if (voteCountsMatch) updatedThingIds.push(voteCountsMatch.thingId);
  updatedThingIds = R.concat(updatedThingIds, getEdgeIds(readSEA(diff)));
  if (!updatedThingIds.length) return;
  const existing = await orc
    .newScope()
    .get(route.soul)
    .then(getListingIds);
  const isSticky = R.equals(route.match.thingId || null);
  const { stickyIds = [], ids: initialIds = [] } = groupBySticky(
    isSticky,
    existing
  );
  let ids = initialIds;
  while ((nextId = updatedThingIds.pop())) {
    if (isSticky(nextId)) continue;
    ids = await sortId(orc, route, scope, sort, ids, nextId);
  }
  for (const key in scope.getAccesses()) orc.listen(key, route.soul);
  if (ids !== initialIds)
    route.write({ ids: R.uniq(stickyIds.concat(ids)).join("+") });
};

export const onPutSpaceHandler = sort => async (
  orc,
  route,
  { updatedSoul, diff, original, latest = 0 }
) => {
  marky.mark(`onPut:${route.soul}:${updatedSoul}`);
  const now = new Date().getTime();
  let nextId;
  let updatedThingIds = [];
  const scope = orc.newScope();
  const spaceMatch = routes.SpaceListing.match(route.soul);
  const voteCountsMatch = routes.ThingVoteCounts.match(updatedSoul);
  const { authorId, name } = spaceMatch || {};
  const page = spaceMatch
    ? await getWikiPage(scope, authorId, `space:${name}`)
    : null;
  const source = toFilters(R.propOr("", "body", page));
  const isSticky = source.isIdSticky;
  const originalData = readSEA(original);
  const diffData = readSEA(diff);
  const existing = await orc
    .newScope()
    .get(route.soul)
    .then(getListingIds);
  const { stickyIds = [], ids: initialIds = [] } = groupBySticky(
    isSticky,
    existing
  );
  let ids = initialIds;

  if (voteCountsMatch) updatedThingIds.push(voteCountsMatch.thingId);
  if (diffData.ids) {
    const noSticky = R.filter(R.complement(isSticky));
    const originalIds = getListingIds(originalData);
    const modifiedIds = getListingIds(diffData);
    const added = noSticky(R.difference(modifiedIds, originalIds));
    const removed = noSticky(R.difference(originalIds, modifiedIds));
    if (removed.length) ids = R.without(removed, ids);
    if (added.length) updatedThingIds = R.concat(updatedThingIds, added);
    if (added.length || removed.length)
      console.log("ids changed", route.soul, updatedSoul, { added, removed });
  }

  while ((nextId = updatedThingIds.pop())) {
    if (isSticky(nextId)) continue;
    ids = await sortId(orc, route, scope, sort, ids, nextId, source);
  }

  for (const key in scope.getAccesses()) orc.listen(key, route.soul);
  if (ids !== initialIds)
    route.write({ ids: R.uniq(stickyIds.concat(ids)).join("+") });

  console.log(
    "onPut",
    route.soul,
    updatedSoul,
    marky.stop(`onPut:${route.soul}:${updatedSoul}`).duration
  );
  if (voteCountsMatch || diffData.ids) return;

  // base logic from gun-cleric-scope needs to be encapsualted better?
  console.log("---STANDARD SPACE UPDATE---", route.soul, updatedSoul);
  const knownTimestamp = await orc.timestamp(route.soul);
  if (latest && knownTimestamp >= latest) return;
  return orc.work({
    id: `update:${route.soul}:${latest}`,
    soul: route.soul,
    method: "doUpdate",
    latest: latest || now,
    priority: route.priority || 50
  });
};
