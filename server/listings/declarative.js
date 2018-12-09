import { compose, lte, gte, prop, propOr, path, keysIn } from "ramda";
import urllite from "urllite";
import {
  multiAuthor,
  multiTopic,
  multiDomain,
  multiSubmission,
  repliesToAuthor,
  sortThings
} from "../queries";
import { LISTING_SIZE, curate, censor, serializeListing } from "./utils";
import * as SOULS from "../notabug-peer/schema";
import { query } from "../notabug-peer/scope";
import { parseListingSource, getWikiPage } from "../notabug-peer/listings";

const itemSources = {
  replies: (scope, { getValues, getValue }) => {
    const repliesToAuthorId = getValues("replies to author").map(
      id => `~${id}`
    )[0];
    const type = getValue("type");
    if (!repliesToAuthorId) return itemSources.topic();
    return repliesToAuthor(scope, { type, repliesToAuthorId });
  },
  op: (scope, { getValues }) => {
    const submissionIds = getValues("op");
    if (!submissionIds) return itemSources.topic();
    return multiSubmission(scope, { submissionIds });
  },
  curator: (scope, { getValues }) => {
    const curators = getValues("curator");
    if (!curators.length) return itemSources.topic();
    return curate(scope, curators.map(id => `~${id}`), true).then(ids =>
      ids.map(thingid => SOULS.thing.soul({ thingid }))
    );
  },
  author: (scope, { getValues, getValue }) => {
    const authorIds = getValues("author").map(id => `~${id}`);
    const type = getValue("type");
    if (!authorIds) return itemSources.topic();
    return multiAuthor(scope, { type, authorIds });
  },
  domain: (scope, { getValues }) => {
    const domains = getValues("domain");
    if (!domains.length) return itemSources.topic();
    return multiDomain(scope, { domains });
  },
  topic: (scope, { getValues, getValue }) => {
    const topics = getValues("topic");
    const sort = getValue("sort") || "new";
    if (!topics.length) topics.push("all");
    return multiTopic(scope, { topics, sort });
  }
};

export const declarativeListing = query((scope, source) => {
  const definition = parseListingSource(source);
  const { isPresent, getValue, getValues, getLastValue } = definition;
  const itemSource = keysIn(itemSources).find(isPresent) || "topic";
  const sort = getValue("sort") || "new";
  const tabulator = `~${getValue("tabulator")}`;
  let name = getValue("name");
  let submitTopic = getLastValue("submit to") || "";
  const censors = getValues("censor");
  const opId = getValue("op");

  const needsData = !![
    itemSource !== "topic" ? "topic" : null,
    itemSource !== "domain" ? "domain" : null,
    itemSource !== "author" ? "author" : null,
    "kind",
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
          .get(SOULS.thing.soul({ thingid: opId }))
          .get("data")
          .then(data => {
            name = name || prop("topic", data);
            submitTopic = submitTopic || prop("topic", data);
            return thingSouls;
          });
      }
      if (getValue("author")) {
        return scope.get(`~${getValue("author")}`).then(meta => {
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
        tabulator,
        scores: needsScores,
        data: needsData
      })
    )
    .then(things => {
      const filters = [];
      const upsMin = getValue("ups above");
      const upsMax = getValue("ups below");
      const downsMin = getValue("downs above");
      const downsMax = getValue("downs below");
      const scoreMin = getValue("score above");
      const scoreMax = getValue("score below");
      const addFilter = (...fns) => filters.push(compose(...fns));

      if (upsMin !== null)
        addFilter(lte(upsMin), parseInt, path(["votes", "up"]));
      if (upsMax !== null)
        addFilter(gte(upsMax), parseInt, path(["votes", "up"]));
      if (downsMin !== null)
        addFilter(lte(downsMin), parseInt, path(["votes", "down"]));
      if (downsMax !== null)
        addFilter(gte(downsMax), parseInt, path(["votes", "down"]));
      if (scoreMin !== null)
        addFilter(lte(scoreMin), parseInt, path(["votes", "score"]));
      if (scoreMax !== null)
        addFilter(gte(scoreMax), parseInt, path(["votes", "score"]));
      if (getValues("topic").length && itemSource !== "topic")
        addFilter(t => !!isPresent(["topic", t]), path(["data", "topic"]));
      if (getValues("ban topic").length)
        addFilter(
          topic => !isPresent(["ban", "topic", topic]),
          path(["data", "topic"])
        );
      if (getValues("ban domain").length)
        addFilter(
          domain => !domain || !isPresent(["ban", "domain", domain]),
          url => url && (urllite(url).host || "").replace(/^www\./, ""),
          path(["data", "url"])
        );
      if (getValues("ban author").length)
        addFilter(
          authorId => !isPresent(["ban", "author", authorId]),
          path(["data", "authorId"])
        );
      if (getValues("ban alias").length)
        addFilter(
          alias => !isPresent(["ban", "alias", alias]),
          path(["data", "author"])
        );
      if (getValues("kind").length)
        addFilter(kind => !!isPresent(["kind", kind]), path(["data", "kind"]));

      if (filters.length)
        return things.filter(thing => !filters.find(fn => !fn(thing)));
      return things;
    })
    .then(things => censor(scope, censors.map(id => `~${id}`), things))
    .then(things => things.slice(0, LISTING_SIZE))
    .then(things => serializeListing({ name, things }))
    .then(serialized => ({
      ...serialized,
      source,
      submitTopic,
      includeRanks: !!isPresent("show ranks"),
      tabs: "",
      curators: "",
      censors: ""
    }));
});

export const listingFromPage = query(
  (scope, authorId, name, extraSource = "") => {
    const extra = `
# added by indexer
${extraSource || ""}
sourced from page ${authorId} ${name}
`;
    return getWikiPage(scope, authorId, name).then(
      compose(
        body => declarativeListing(scope, `${body}\n\n${extra}`),
        propOr("", "body")
      )
    );
  }
);
