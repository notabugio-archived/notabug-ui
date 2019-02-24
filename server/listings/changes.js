import * as R from "ramda";
import { routes } from "../notabug-peer/json-schema";
import { getRow, getListingKeys } from "../notabug-peer/source";
import { updateThings } from "./update";
import { readSEA, spaceFromSoul, getEdgeIds } from "./utils";

const categorizeListingDiff = (diff, original) => {
  const allKeys = getListingKeys(diff);
  const added = [];
  const removed = [];

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    const [_diffIdx, diffId] = getRow(diff, key) || [];
    const [_origIdx, origId] = getRow(original, key);

    if (diffId !== origId) {
      if (diffId) added.push(diffId);
      if (origId) removed.push(origId);
    }
  }

  return [added, removed];
};

export const onPutListingHandler = sort => async (
  orc,
  route,
  { updatedSoul, diff }
) => {
  let updatedIds = [];
  const scope = orc.newScope();
  const voteCountsMatch = routes.ThingVoteCounts.match(updatedSoul);
  const isSticky = R.equals(route.match.thingId || null);

  if (voteCountsMatch) updatedIds.push(voteCountsMatch.thingId);
  updatedIds = R.concat(updatedIds, getEdgeIds(readSEA(diff)));
  await updateThings(orc, route, scope, sort, updatedIds, [], isSticky);
  for (const key in scope.getAccesses()) orc.listen(key, route.soul);
};

export const onPutRepliesHandler = sort => async (
  orc,
  route,
  { updatedSoul, diff }
) => {
  const scope = orc.newScope();
  let updatedIds = getEdgeIds(readSEA(diff));
  const diffData = readSEA(diff);
  const [updatedAuthored] = categorizeListingDiff(diffData);

  for (var i = 0; i < updatedAuthored.length; i++) {
    const opId = updatedAuthored[i];
    const replyIds = getEdgeIds(await getThingReplies(scope, opId));
    updatedIds = updatedIds.concat(replyIds);
  }

  if (updatedIds.length)
    await updateThings(orc, route, scope, sort, updatedIds, []);
  for (const key in scope.getAccesses()) orc.listen(key, route.soul);
};

export const onPutSpaceHandler = sort => async (
  orc,
  route,
  { updatedSoul, diff, original, latest = 0 }
) => {
  const now = new Date().getTime();
  const scope = orc.newScope();
  const originalData = readSEA(original);
  const diffData = readSEA(diff);
  const [updatedIds, removedIds] = categorizeListingDiff(diffData);
  const { pageId, def } = await spaceFromSoul(scope, route.soul);
  const { isIdSticky } = def;
  const voteCountsMatch = routes.ThingVoteCounts.match(updatedSoul);
  const thingMatch = routes.Thing.match(updatedSoul);
  const signedThingDataMatch = routes.ThingDataSigned.match(updatedSoul);
  const authorMatch = routes.SEAAuthor.match(updatedSoul);

  if (voteCountsMatch) updatedIds.push(voteCountsMatch.thingId);
  if (thingMatch) updatedIds.push(thingMatch.thingId);
  if (signedThingDataMatch && signedThingDataMatch.thingId !== pageId)
    updatedIds.push(signedThingDataMatch.thingId);
  await updateThings(
    orc,
    route,
    scope,
    sort,
    updatedIds,
    removedIds,
    isIdSticky,
    def
  );
  for (const key in scope.getAccesses()) orc.listen(key, route.soul);
  if (
    R.prop("size", original) ||
    updatedIds.length ||
    removedIds.length ||
    authorMatch
  )
    return;

  // base logic from gun-cleric-scope needs to be encapsualted better?
  console.log("---STANDARD SPACE UPDATE---", route.soul, updatedSoul);
  const knownTimestamp = await orc.timestamp(route.soul);

  return orc.work({
    id: `update:${route.soul}:${latest}`,
    soul: route.soul,
    method: "doUpdate",
    priority: route.priority || 50
  });
};
