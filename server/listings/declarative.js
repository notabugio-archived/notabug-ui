import {
  identity,
  compose,
  lte,
  gte,
  prop,
  propOr,
  path,
  keysIn,
  uniqBy
} from "ramda";
import {
  multiAuthor,
  multiTopic,
  multiDomain,
  multiSubmission,
  repliesToAuthor,
  sortThings
} from "../queries";
import { query } from "gun-scope";
import { LISTING_SIZE, curate, censor, serializeListing } from "./utils";
import { routes as souls } from "../notabug-peer/json-schema";
import { getWikiPage } from "../notabug-peer/listings";
import { toFilters } from "../notabug-peer/source";

const itemSources = {
  replies: (
    scope,
    {
      filters: {
        allow: { repliesTo: repliesToAuthorId, type }
      }
    }
  ) => {
    if (!repliesToAuthorId) return itemSources.topic();
    return repliesToAuthor(scope, {
      type,
      repliesToAuthorId: `~${repliesToAuthorId}`
    });
  },
  op: (
    scope,
    {
      filters: {
        allow: { ops: submissionIds }
      }
    }
  ) => {
    if (!submissionIds.length) return itemSources.topic();
    return multiSubmission(scope, { submissionIds });
  },
  curator: (scope, { curators }) => {
    if (!curators.length) return itemSources.topic();
    return curate(scope, curators.map(id => `~${id}`), true).then(ids =>
      ids.map(thingId => souls.Thing.reverse({ thingId }))
    );
  },
  author: (
    scope,
    {
      filters: {
        allow: { type, authors }
      }
    }
  ) => {
    const authorIds = authors.map(id => `~${id}`);
    if (!authorIds.length) return itemSources.topic();
    return multiAuthor(scope, { type, authorIds });
  },
  domain: (
    scope,
    {
      filters: {
        allow: { domains }
      }
    }
  ) => {
    if (!domains.length) return itemSources.topic();
    return multiDomain(scope, { domains });
  },
  topic: (
    scope,
    {
      sort,
      filters: {
        allow: { topics }
      }
    }
  ) => {
    if (!topics.length) topics.push("all");
    return multiTopic(scope, { topics, sort: sort || "new" });
  }
};

export const declarativeListing = query((scope, source) => {
  const definition = toFilters(source);
  const {
    itemSource,
    tabulator,
    censors,
    isPresent,
    thingFilter,
    uniqueByContent,
    stickyIds
  } = definition;
  const sort = definition.sort || "new";
  const opId = definition.filters.allow.ops[0];
  let { displayName: name } = definition;
  let submitTopic = definition.submitTopics[0] || "";
  const author = definition.filters.allow.authors[0];

  const needsData = !![
    itemSource !== "topic" ? "topic" : null,
    itemSource !== "domain" ? "domain" : null,
    itemSource !== "author" ? "author" : null,
    "unique by content",
    "kind",
    "require signed",
    "require anon",
    "alias",
    "ban domain",
    "ban topic",
    "ban author",
    "ban alias"
  ].find(isPresent);

  const needsScores = !![
    "sort hot",
    "sort top",
    "sort best",
    "sort controversial",
    "ups",
    "downs",
    "score"
  ].find(isPresent);

  return itemSources[itemSource](scope, definition)
    .then(thingSouls => {
      if (opId) {
        return scope
          .get(souls.Thing.reverse({ thingId: opId }))
          .get("data")
          .then(data => {
            name = name || prop("topic", data);
            submitTopic = submitTopic || prop("topic", data);
            return thingSouls;
          });
      }
      if (author) {
        return scope.get(`~${author}`).then(meta => {
          name = name || propOr("", "alias", meta);
          return thingSouls;
        });
      }
      return thingSouls;
    })
    .then(thingSouls =>
      sortThings(scope, {
        sort,
        thingSouls,
        tabulator: `~${tabulator}`,
        scores: needsScores,
        data: needsData
      })
    )
    .then(things => things.filter(thingFilter))
    .then(things => {
      if (!uniqueByContent) return things;
      return uniqBy(thing => {
        const author = path(["data", "author"], thing);
        const title = path(["data", "title"], thing);
        const body = path(["data", "body"], thing);
        const url = path(["data", "url"], thing);
        return JSON.stringify({ title, body, url, author });
      }, things);
    })
    // TODO: filter in chunks until > LISTING_SIZE
    .then(things => censor(scope, censors.map(id => `~${id}`), things))
    .then(things => things.slice(0, LISTING_SIZE))
    .then(things => serializeListing({ name, things, stickyIds }))
    .then(serialized => ({ ...serialized, source, submitTopic }));
});

export const listingFromPage = query(
  (scope, authorId, name, extraSource = "", transformSource = identity) => {
    const extra = `
# added by indexer
${extraSource || ""}
sourced from page ${authorId} ${name}
`;
    return getWikiPage(scope, authorId, name).then(
      compose(
        body =>
          declarativeListing(
            scope,
            `${body}\n${transformSource(body)}\n${extra}`
          ),
        propOr("", "body")
      )
    );
  }
);
