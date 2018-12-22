import { prop, path } from "ramda";
import { scope as getScope, query, resolve } from "./scope";
import * as SCHEMA from "./schema";

const listing = query(
  (scope, soul) => (soul ? scope.get(soul) : resolve(null)),
  "listing"
);

const getThingScores = query(
  (scope, tabulator, thingid) =>
    scope
      .get(`${SCHEMA.thing.soul({ thingid })}/votecounts@~${tabulator}.`)
      .then(),
  "thingScores"
);

const getThingData = query(
  (scope, thingid) => scope.get(SCHEMA.thing.soul({ thingid })).get("data"),
  "thingData"
);

const getUserPages = query(
  (scope, authorId) => scope.get(SCHEMA.userPages.soul({ authorId })),
  "userPages"
);

const getWikiPageId = query(
  (scope, authorId, name) =>
    scope
      .get(SCHEMA.userPages.soul({ authorId }))
      .get(name)
      .get("id"),
  "wikiPageId"
);

export const getWikiPage = query((scope, authorId, name) =>
  getWikiPageId(scope, authorId, name).then(id => id && getThingData(scope, id))
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
  userPages: getUserPages,
  wikiPageId: getWikiPageId,
  wikiPage: getWikiPage,
  userMeta: userMetaQuery
});
export const newScope = nab => (opts = {}) =>
  getScope({ ...opts, gun: nab.gun });
