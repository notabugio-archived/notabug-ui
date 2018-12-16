import { prop, path, trim, assocPath, keysIn } from "ramda";
import { scope as getScope, query } from "./scope";
import * as SOULS from "./schema";
import { tabulator as defaultIndexer } from "../config.json";

export const parseListingSource = source => {
  const tokenMap = (source || "").split("\n").reduce((def, line) => {
    const tokens = line
      .trim()
      .split(" ")
      .map(trim)
      .filter(x => x);
    if (!tokens.length) return def;
    return assocPath(tokens, {}, def);
  }, {});

  const isPresent = p => {
    let check = p;
    if (typeof p === "string") check = p.split(" ");
    return check && path(check, tokenMap);
  };

  const getValues = p => keysIn(isPresent(p));
  const getValue = p => getValues(p)[0] || null;
  const getLastValue = p => getValues(p).pop() || null;

  const getValueChain = p => {
    const keys = typeof p === "string" ? p.split(" ") : p;
    const values = [];
    let next = p;

    while (next) {
      next = getValue([...keys, ...values]);
      next && values.push(next);
    }

    return values;
  };

  const getPairs = p => {
    const keys = typeof p === "string" ? p.split(" ") : p;
    return getValues(keys).reduce((pairs, key) => {
      const val = getValue([...keys, key]);
      return [...pairs, [key, val]];
    }, []);
  };

  return {
    isPresent,
    getValue,
    getValues,
    getLastValue,
    getValueChain,
    getPairs
  };
};

export const spaceSourceWithDefaults = ({
  owner,
  name,
  source,
  tabs = ["hot", "new", "discussed", "controversial", "top"]
}) => {
  let result = [source || ""];
  const parsedSource = parseListingSource(source);

  if (!parsedSource.getValue("tab")) {
    tabs.map(tab =>
      result.push(`tab ${tab} /user/${owner}/spaces/${name}/${tab}`)
    );
  }

  let indexer = parsedSource.getValue("indexer");
  if (!indexer) {
    result.push(`indexer ${defaultIndexer}`);
    indexer = defaultIndexer;
  }

  let tabulator = parsedSource.getValue("tabulator");
  if (!tabulator) {
    result.push(`tabulator ${indexer}`);
  }

  return result.join("\n");
};

const listing = query((scope, soul) => scope.get(soul), "listing");

const getThingScores = query(
  (scope, tabulator, thingid) =>
    scope
      .get(`${SOULS.thing.soul({ thingid })}/votecounts@~${tabulator}.`)
      .then(),
  "thingScores"
);

const getThingData = query(
  (scope, thingid) => scope.get(SOULS.thing.soul({ thingid })).get("data"),
  "thingData"
);

const getUserPages = query(
  (scope, authorId) => scope.get(SOULS.userPages.soul({ authorId })),
  "userPages"
);

const getWikiPageId = query(
  (scope, authorId, name) =>
    scope
      .get(SOULS.userPages.soul({ authorId }))
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
