import { prop, path } from "ramda";
import { scope as getScope, query, resolve } from "gun-scope";
import { routes } from "./json-schema";

const listing = query(
  (scope, soul) => (soul ? scope.get(soul) : resolve(null)),
  "listing"
);

const getThingScores = query(
  (scope, tabulator, thingId) =>
    tabulator
      ? scope
          .get(`${routes.Thing.reverse({ thingId })}/votecounts@~${tabulator}.`)
          .then()
      : resolve(),
  "thingScores"
);

export const getThingReplies = query(
  (scope, thingId) =>
    scope.get(routes.ThingComments.reverse({ thingId })).then()
);

const getThingData = query(
  (scope, thingId) => thingId ? scope.get(routes.Thing.reverse({ thingId })).get("data") : resolve(null),
  "thingData"
);

const getUserPages = query(
  (scope, authorId) => scope.get(routes.AuthorPages.reverse({ authorId })),
  "userPages"
);

export const getWikiPageId = query(
  (scope, authorId, name) =>
    scope
      .get(routes.AuthorPages.reverse({ authorId }))
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
