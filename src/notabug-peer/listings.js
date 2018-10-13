import { compose, prop, path } from "ramda";
import { scope as getScope, query } from "./scope";
import * as SOULS from "./souls";

const listingIds = query(
  (scope, soul) =>
    scope.get(soul).then(compose(ids => (ids || "").split("+").filter(x => !!x), prop("ids"))),
  "listingIds"
);

const getThingScores = query(
  (scope, thingid, tabulator) =>
    scope.get(`${SOULS.thing.soul({ thingid })}/votecounts@${tabulator}.`).then(),
  "thingScores"
);

const getThingData = query(
  (scope, thingid) =>
    scope.get(SOULS.thingData.soul({ thingid })).then(res => {
      if (!res) return res;
      const { _, ...data } = res; // eslint-disable-line no-unused-vars
      return data;
    }),
  "thingData"
);

const userMetaQuery = query(
  (scope, id) => scope.get(id).then(meta => ({
    userAlias: prop("alias", meta),
    createdAt: path(["_", ">", "pub"], meta),
  })),
  "userMeta"
);

export const queries = () => ({
  listingIds,
  thingData: getThingData,
  thingScores: getThingScores,
  userMeta: userMetaQuery
});
export const newScope = nab => (opts={}) => getScope({ ...opts, gun: nab.gun });
