import * as R from "ramda";
import { sorts } from "../queries";
import { routes } from "../notabug-peer/json-schema";

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
  R.keys
  // This approach is more correct, but requires SEA read
  /*
  R.map(R.prop("#")),
  R.values
  */
);

const groupBySticky = (isSticky, allIds) =>
  R.groupBy(
    R.compose(
      R.ifElse(R.identity, R.always("stickyIds"), R.always("ids")),
      isSticky
    ),
    allIds
  );

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
  //if (m >= ids.length - 1) return -1;
  return m - 1;
};

export const sortId = async (orc, route, scope, sort, existingIds, thingId) => {
  let ids = existingIds.slice();
  const existingIndex = ids.indexOf(thingId);
  const tabulator = `~${orc.pub}`;

  if (existingIndex !== -1) ids.splice(existingIndex, 1);
  const bsIndex = await binarySearch(ids, thingId, id =>
    sorts[sort].getValueForId(scope, id, { tabulator })
  );

  if (bsIndex < 0 || bsIndex === existingIndex) return existingIds;
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
  updatedThingIds = R.concat(updatedThingIds, getEdgeIds(diff));
  if (!updatedThingIds.length) return;
  const existing = await orc
    .newScope()
    .get(route.soul)
    .then(getListingIds);
  const isSticky = R.equals(route.match.thingId || null);
  const { stickyIds = [], ids: initialIds = [] } = groupBySticky(isSticky, existing);
  let ids = initialIds;
  while ((nextId = updatedThingIds.pop())) {
    if (isSticky(nextId)) continue;
    ids = await sortId(orc, route, scope, sort, ids, nextId);
  }
  for (const key in scope.getAccesses()) orc.listen(key, route.soul);
  if (ids !== initialIds) route.write({ ids: R.uniq(stickyIds.concat(ids)).join("+") });
};
