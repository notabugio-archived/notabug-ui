import { prop, path, trim, assocPath } from "ramda";
import { scope as getScope, query } from "./scope";
import * as SOULS from "./souls";

export const parseListingSource = source =>
  source.split("\n").reduce((def, line) => {
    const tokens = line
      .trim()
      .split(" ")
      .map(trim)
      .filter(x => x);
    if (!tokens.length) return def;
    return assocPath(tokens, {}, def);
  }, {});

const listing = query((scope, soul) => scope.get(soul), "listing");

const getThingScores = query(
  (scope, tabulator, thingid) =>
    scope
      .get(`${SOULS.thing.soul({ thingid })}/votecounts@~${tabulator}.`)
      .then(),
  "thingScores"
);

const getThingData = query(
  (scope, thingid) =>
    scope
      .get(SOULS.thing.soul({ thingid }))
      .get("data")
      .then(res => {
        if (!res) return res;
        //const { _, ...data } = res; // eslint-disable-line no-unused-vars
        return res;// data;
      }),
  "thingData"
);

const userMetaQuery = query(
  (scope, id) =>
    scope.get(id).then(meta => ({
      userAlias: prop("alias", meta),
      createdAt: path(["_", ">", "pub"], meta)
    })),
  "userMeta"
);

export const queries = () => ({
  listing,
  thingData: getThingData,
  thingScores: getThingScores,
  userMeta: userMetaQuery
});
export const newScope = nab => (opts = {}) =>
  getScope({ ...opts, gun: nab.gun });
