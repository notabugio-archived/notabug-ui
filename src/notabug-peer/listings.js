import { prop, path, trim, assocPath } from "ramda";
import { scope as getScope, query } from "./scope";
import * as SOULS from "./schema";

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
      .get("data"),
  "thingData"
);

const getWikiPageId = query(
  (scope, authorId, name) =>
    scope
      .get(SOULS.userPages.soul({ authorId }))
      .get(name)
      .get("id"),
  "wikiPageId"
);

export const getWikiPage = query(
  (scope, authorId, name) =>
    getWikiPageId(scope, authorId, name)
      .then(id => id && getThingData(scope, id))
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
  wikiPageId: getWikiPageId,
  wikiPage: getWikiPage,
  userMeta: userMetaQuery
});
export const newScope = nab => (opts = {}) =>
  getScope({ ...opts, gun: nab.gun });
