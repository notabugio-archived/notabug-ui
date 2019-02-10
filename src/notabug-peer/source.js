import { compose, lte, gte, path, trim, assocPath, keysIn } from "ramda";
import * as R from "ramda";
import { parse as parseURI } from "uri-js";
import { tabulator as defaultIndexer } from "../config.json";
import { COMMAND_RE } from "./constants";

const potentialSources = [
  "listing",
  "replies",
  "op",
  "curator",
  "author",
  "domain",
  "topic"
];

export const toListingObject = (source, ownerId = null, spaceName = null) => {
  const parsedSource = parseListingSource(source);
  const obj = { ...parsedSource };
  const {
    isPresent,
    getValue,
    getValues,
    getValueChain,
    getPairs
  } = parsedSource;
  [
    obj.fromPageAuthor = ownerId,
    obj.fromPageName = spaceName ? `space:${spaceName}` : undefined
  ] = getValueChain("sourced from page");
  obj.itemSource = potentialSources.find(isPresent) || "topic";
  obj.displayName = parsedSource.getValue("name") || spaceName;
  obj.indexer = getValue("tabulator") || defaultIndexer;
  obj.tabulator = getValue("tabulator") || obj.indexer;
  obj.tabs = getPairs("tab");
  obj.sort = getValue("sort");
  obj.uniqueByContent = !!isPresent("unique by content");
  obj.curators = getValues("curator");
  obj.censors = getValues("censor");
  obj.moderators = getValues("mod");
  obj.includeRanks = !!isPresent("show ranks");
  obj.stickyIds = getValues("sticky");
  obj.isIdSticky = id => !!parsedSource.isPresent(["sticky", id]);
  obj.submitTopics = getValues("submit to");
  obj.submitTopic = getValue("submit to");
  obj.chatTopic = getValue("chat in");

  if (ownerId && spaceName) {
    obj.spaceName = spaceName;
    obj.owner = ownerId;
    obj.useForComments = !parsedSource.isPresent("comments leave space");
    obj.path = `/user/${ownerId}/spaces/${spaceName}`;
    obj.defaultTab = parsedSource.getValue("tab");
    obj.defaultTabPath = obj.defaultTab
      ? parsedSource.getValue(["tab", obj.defaultTab])
      : null;
  }

  obj.filters = {
    functions: [],
    allow: {
      repliesTo: getValue("replies to author"),
      type: getValue("type"), // TODO: this field seems redundant with kind and should be deprecated
      ops: getValues("op"),
      aliases: getValues("alias"),
      authors: getValues("author"),
      domains: getValues("domain"),
      topics: getValues("topic"),
      listings: getValues("listing"),
      kinds: getValues("kind"),
      anon: !isPresent("require signed"),
      signed: !isPresent("require anon")
    },
    deny: {
      aliases: getValues("ban alias"),
      authors: getValues("ban author"),
      domains: getValues("ban domain"),
      topics: getValues("ban topic"),
      anon: !!isPresent("require signed"),
      signed: !!isPresent("require anon")
    }
  };

  obj.voteFilters = {
    functions: [],
    upsMin: parseInt(getValue("ups above")) || null,
    upsMax: parseInt(getValue("ups below")) || null,
    downsMin: parseInt(getValue("downs above")) || null,
    downsMax: parseInt(getValue("downs below")) || null,
    scoreMin: parseInt(getValue("score above")) || null,
    scoreMax: parseInt(getValue("score below")) || null
  };

  return obj;
};

const intPath = p =>
  compose(
    parseInt,
    path(p)
  );

export const toFilters = obj => {
  if (typeof obj === "string") obj = toListingObject(obj);
  const { filters, voteFilters, isPresent, itemSource } = obj;
  const filterFunctions = [];
  const voteFilterFunctions = [];

  const addFilter = (...fns) => filterFunctions.push(compose(...fns));
  const addVoteFilter = (...fns) => voteFilterFunctions.push(compose(...fns));

  if (filters.allow.aliases.length)
    addFilter(t => !!isPresent(["alias", t]), path(["data", "author"]));
  if (filters.allow.authors.length && itemSource !== "author")
    addFilter(t => !!isPresent(["author", t]), path(["data", "authorId"]));
  if (filters.allow.domains.length && itemSource !== "domain")
    addFilter(t => !!isPresent(["domain", t]), path(["data", "domain"]));
  if (filters.allow.topics.length && itemSource !== "topic")
    addFilter(t => !!isPresent(["topic", t]), path(["data", "topic"]));
  if (filters.allow.kinds.length)
    addFilter(kind => !!isPresent(["kind", kind]), path(["data", "kind"]));
  if (filters.allow.type === "commands")
    addFilter(
      R.compose(
        R.test(COMMAND_RE),
        path(["data", "body"])
      )
    );

  if (filters.deny.aliases.length)
    addFilter(
      alias => !isPresent(["ban", "alias", alias]),
      path(["data", "author"])
    );
  if (filters.deny.authors.length)
    addFilter(
      authorId => !isPresent(["ban", "author", authorId]),
      path(["data", "authorId"])
    );
  if (filters.deny.domains.length)
    addFilter(
      domain => !domain || !isPresent(["ban", "domain", domain]),
      url => {
        if (!url) return;
        const parsed = parseURI(url);
        return (parsed.host || parsed.scheme || "").replace(/^www\./, "");
      },
      path(["data", "url"])
    );
  if (filters.deny.topics.length)
    addFilter(
      topic => !isPresent(["ban", "topic", topic]),
      path(["data", "topic"])
    );
  if (filters.deny.anon) addFilter(path(["data", "authorId"]));
  if (filters.deny.signed)
    addFilter(
      compose(
        authorId => !authorId,
        path(["data", "authorId"])
      )
    );

  if (voteFilters.upsMin !== null)
    addVoteFilter(lte(voteFilters.upsMin), intPath(["votes", "up"]));
  if (voteFilters.upsMax !== null)
    addVoteFilter(gte(voteFilters.upsMax), intPath(["votes", "up"]));
  if (voteFilters.downsMin !== null)
    addVoteFilter(lte(voteFilters.downsMin), intPath(["votes", "down"]));
  if (voteFilters.downsMax !== null)
    addVoteFilter(gte(voteFilters.downsMax), intPath(["votes", "down"]));
  if (voteFilters.scoreMin !== null)
    addVoteFilter(lte(voteFilters.scoreMin), intPath(["votes", "score"]));
  if (voteFilters.scoreMax !== null)
    addVoteFilter(gte(voteFilters.scoreMax), intPath(["votes", "score"]));

  const contentFilter = thing => !filterFunctions.find(fn => !fn(thing));
  const voteFilter = thing => !voteFilterFunctions.find(fn => !fn(thing));
  const thingFilter = thing => contentFilter(thing) && voteFilter(thing);

  return { ...obj, thingFilter, contentFilter, voteFilter };
};

const parseListingSource = source => {
  if (source && typeof source !== "string") {
    console.warn("unexpected source type", source);
    source = "";
  }
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
    source,
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
