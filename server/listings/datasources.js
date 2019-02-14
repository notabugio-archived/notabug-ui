import * as R from "ramda";
import { routes } from "../notabug-peer/json-schema";
import { LISTING_SIZE, curate } from "./utils";
import {
  sorts,
  sortThings,
  multiAuthor,
  multiTopic,
  multiDomain,
  multiSubmission,
  singleListing,
  thingMeta,
  repliesToAuthor
} from "../queries";

const sortSoulLists = R.sortWith([R.ascend(R.prop("sortValue"))]);

const needsScores = parsed =>
  !![
    "sort hot",
    "sort top",
    "sort best",
    "sort controversial",
    "ups",
    "downs",
    "score"
  ].find(parsed.isPresent);

const needsData = parsed =>
  !![
    parsed.itemSource !== "topic" ? "topic" : null,
    parsed.itemSource !== "domain" ? "domain" : null,
    parsed.itemSource !== "author" ? "author" : null,
    "unique by content",
    "kind",
    "type",
    "require signed",
    "require anon",
    "alias",
    "ban domain",
    "ban topic",
    "ban author",
    "ban alias"
  ].find(parsed.isPresent);

const soulList = async (scope, parsed, allSouls) => {
  const tabulator = `~${parsed.tabulator}`;
  const remaining = allSouls.slice();
  const topSoul = remaining.splice(0, 1)[0];
  const topItem = topSoul
    ? await thingMeta(scope, {
        thingSoul: topSoul,
        tabulator,
        scores: needsScores(parsed),
        data: needsData(parsed)
      })
    : null;
  const { thingId } = routes.Thing.match(topSoul) || {};
  const sortValue = thingId
    ? await sorts[parsed.sort].getValueForId(scope, thingId, { tabulator })
    : null;
  const pop = async () => {
    const nextList = await soulList(scope, parsed, remaining);
    return [topItem, nextList];
  };
  return { topItem, thingId, sortValue, pop };
};

// This is an optimization for fetching from multiple sorted listings
const fetchSortedSouls = async (scope, parsed, sortedListsOfSouls) => {
  const result = [];
  let soulLists = sortSoulLists(
    R.filter(
      R.prop("topItem"),
      await Promise.all(
        R.map(allSouls => soulList(scope, parsed, allSouls), sortedListsOfSouls)
      )
    )
  );

  const getNextItem = async () => {
    const topItem = R.path([0, "topItem"], soulLists);
    const [item, soulList] = await soulLists[0].pop();
    soulLists[0] = soulList;
    soulLists = sortSoulLists(soulLists);
    if (!item) {
      soulLists.splice(0, 1);
      if (soulLists.length) return getNextItem();
    }

    return item;
  };

  let nextItem = await getNextItem();
  while (nextItem && result.length < LISTING_SIZE) {
    if (parsed.thingFilter(nextItem)) result.push(nextItem);
    if (result.length < LISTING_SIZE) nextItem = await getNextItem();
  }

  return result;
};

const fromListings = (scope, parsed, listings) =>
  Promise.all(
    R.map(
      listing =>
        singleListing(scope, {
          listing,
          indexer: parsed.indexer,
          sort: parsed.sort || "new"
        }),
      listings
    )
  ).then(sortedListsOfSouls =>
    fetchSortedSouls(scope, parsed, sortedListsOfSouls)
  );

const fromSouls = (scope, parsed) => thingSouls =>
  sortThings(scope, {
    thingSouls,
    sort: parsed.sort,
    tabulator: `~${parsed.tabulator}`,
    scores: needsScores(parsed),
    data: needsData(parsed)
  })
    .then(R.filter(parsed.thingFilter))
    .then(R.slice(0, LISTING_SIZE));

export const itemSources = {
  listing: (scope, parsed) => {
    const listings = R.path(["filters", "allow", "listings"], parsed) || [];
    if (!listings.length) return itemSources.topic();
    return fromListings(scope, parsed, listings);
  },
  replies: (scope, parsed) => {
    const id = R.path(["filters", "allow", "repliesTo"], parsed);
    const type = R.path(["filters", "allow", "type"], parsed);
    if (!id) return itemSources.topic();
    return repliesToAuthor(scope, { type, repliesToAuthorId: `~${id}` }).then(
      fromSouls(scope, parsed)
    );
  },
  op: (scope, parsed) => {
    const submissionIds = R.path(["filters", "allow", "ops"], parsed);
    if (!submissionIds.length) return itemSources.topic();
    return multiSubmission(scope, { submissionIds }).then(
      fromSouls(scope, parsed)
    );
  },
  curator: (scope, parsed) => {
    const curators = R.prop("curators", parsed) || [];
    if (!curators.length) return itemSources.topic();
    return curate(scope, curators.map(id => `~${id}`), true)
      .then(ids => ids.map(thingId => routes.Thing.reverse({ thingId })))
      .then(fromSouls(scope, parsed));
  },
  author: (scope, parsed) => {
    const authors = R.path(["filters", "allow", "authors"], parsed);
    const type = R.path(["filters", "allow", "type"], parsed);
    const authorIds = authors.map(id => `~${id}`);
    if (!authorIds.length) return itemSources.topic();
    return multiAuthor(scope, { type, authorIds }).then(
      fromSouls(scope, parsed)
    );
  },
  domain: (scope, parsed, useListing = true) => {
    const domains = R.path(["filters", "allow", "domains"], parsed) || [];
    if (!domains.length) return itemSources.topic();
    if (useListing || domains.length > 1) {
      return fromListings(scope, parsed, domains.map(domain => `/t/${domain}`));
    }
    return multiDomain(scope, { domains }).then(fromSouls(scope, parsed));
  },
  topic: (scope, parsed, useListing = true) => {
    const topics = R.path(["filters", "allow", "topics"], parsed) || [];
    if (!topics.length) topics.push("all");
    if (useListing || topics.length > 1) {
      return fromListings(scope, parsed, topics.map(topic => `/t/${topic}`));
    }
    return multiTopic(scope, { topics, sort: parsed.sort || "new" }).then(
      fromSouls(scope, parsed)
    );
  }
};

export const fetchData = (scope, parsed, useListing = true) =>
  itemSources[parsed.itemSource](scope, parsed, useListing);
