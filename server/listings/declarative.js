import { compose, lte, gte, prop, propOr, path, keysIn } from "ramda";
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
  replies: (scope, definition) => {
    const repliesToAuthorId = keysIn(
      path(["replies", "to", "author"], definition)
    ).map(id => `~${id}`)[0];
    const type = keysIn(definition.type)[0];
    if (!repliesToAuthorId) return itemSources.topic();
    return repliesToAuthor(scope, { type, repliesToAuthorId });
  },
  op: (scope, definition) => {
    const submissionIds = keysIn(definition.op);
    if (!submissionIds) return itemSources.topic();
    return multiSubmission(scope, { submissionIds });
  },
  curator: (scope, definition) => {
    const curators = keysIn(definition.curator);
    if (!curators.length) return itemSources.topic();
    return curate(scope, curators.map(id => `~${id}`), true).then(ids =>
      ids.map(thingid => SOULS.thing.soul({ thingid }))
    );
  },
  author: (scope, definition) => {
    const authorIds = keysIn(definition.author).map(id => `~${id}`);
    const type = keysIn(definition.type)[0];
    if (!authorIds) return itemSources.topic();
    return multiAuthor(scope, { type, authorIds });
  },
  domain: (scope, definition) => {
    const domains = keysIn(definition.domain);
    if (!domains.length) return itemSources.topic();
    return multiDomain(scope, { domains });
  },
  topic: (scope, definition) => {
    const topics = keysIn(definition.topic);
    const sort = keysIn(definition.sort)[0] || "new";
    if (!topics.length) topics.push("all");
    return multiTopic(scope, { topics, sort });
  }
};

export const declarativeListing = query((scope, source) => {
  const definition = parseListingSource(source);
  const isPresent = p => {
    let check = p;
    if (typeof p === "string") check = p.split(" ");
    return check && path(check, definition);
  };
  const getValue = p => {
    const keys = keysIn(isPresent(p));
    if (!keys.length) return null;
    return keys[0];
  };
  const itemSource = keysIn(itemSources).find(isPresent) || "topic";
  const sort = keysIn(definition.sort)[0] || "new";
  const tabulator = `~${keysIn(definition.tabulator)[0]}`;
  let name = keysIn(definition.name)[0];
  let submitTopic = keysIn(path(["submit", "to"], definition)).pop() || "";
  const censors = keysIn(definition.censor);
  const opId = keysIn(definition.op)[0];

  const needsData = !![
    itemSource !== "topic" ? ["topic"] : null,
    itemSource !== "domain" ? ["domain"] : null,
    itemSource !== "author" ? ["author"] : null,
    ["kind"],
    ["ban", "domain"],
    ["ban", "topic"],
    ["ban", "author"],
    ["ban", "alias"]
  ].find(isPresent);

  const needsScores = !![
    ["sort", "hot"],
    ["sort", "top"],
    ["sort", "best"],
    ["sort", "controversial"],
    ["ups"],
    ["downs"],
    ["score"]
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
      const authorIds = keysIn(definition.author);
      if (authorIds.length) {
        return scope.get(`~${authorIds[0]}`).then(meta => {
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
      const topics = keysIn(isPresent("topic"));
      const kinds = keysIn(isPresent("kind"));
      if (upsMin !== null)
        filters.push(
          compose(
            lte(upsMin),
            parseInt,
            path(["votes", "up"])
          )
        );
      if (upsMax !== null)
        filters.push(
          compose(
            gte(upsMax),
            parseInt,
            path(["votes", "up"])
          )
        );
      if (downsMin !== null)
        filters.push(
          compose(
            lte(downsMin),
            parseInt,
            path(["votes", "down"])
          )
        );
      if (downsMax !== null)
        filters.push(
          compose(
            gte(downsMax),
            parseInt,
            path(["votes", "down"])
          )
        );
      if (scoreMin !== null)
        filters.push(
          compose(
            lte(scoreMin),
            parseInt,
            path(["votes", "score"])
          )
        );
      if (scoreMax !== null)
        filters.push(
          compose(
            gte(scoreMax),
            parseInt,
            path(["votes", "score"])
          )
        );
      if (topics.length && itemSource !== "topic")
        filters.push(
          compose(
            topic => !!isPresent(["topic", topic]),
            path(["data", "topic"])
          )
        );
      if (kinds.length)
        filters.push(
          compose(
            kind => !!isPresent(["kind", kind]),
            path(["data", "kind"])
          )
        );
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
      includeRanks: !!isPresent(["show", "ranks"]),
      curators: "",
      censors: ""
    }));
});

export const listingFromPage = query(
  (scope, authorId, name, extraSource = "") =>
    getWikiPage(scope, authorId, name).then(
      compose(
        body =>
          declarativeListing(
            scope,
            extraSource ? `${body}\n\n# added by indexer\n${extraSource}` : body
          ),
        propOr("", "body")
      )
    )
);
