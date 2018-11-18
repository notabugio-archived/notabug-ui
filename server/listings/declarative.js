import { prop, propOr, path, assocPath, keysIn, trim } from "ramda";
import {
  multiAuthor,
  multiTopic,
  multiDomain,
  multiSubmission,
  repliesToAuthor,
  sortThings
} from "../queries";
import { LISTING_SIZE, curate, censor, serializeListing } from "./utils";
import { SOUL_DELIMETER } from "../notabug-peer/util";
import * as SOULS from "../notabug-peer/souls";
import { query } from "../notabug-peer/scope";

const sources = {
  replies: (scope, definition) => {
    const repliesToAuthorId = keysIn(
      path(["replies", "to", "author"], definition)
    ).map(id => `~${id}`)[0];
    const type = keysIn(definition.type)[0];
    if (!repliesToAuthorId) return sources.topic();
    return repliesToAuthor(scope, { type, repliesToAuthorId });
  },
  op: (scope, definition) => {
    const submissionIds = keysIn(definition.op);
    if (!submissionIds) return sources.topic();
    return multiSubmission(scope, { submissionIds });
  },
  curator: (scope, definition) => {
    const curators = keysIn(definition.curator);
    if (!curators.length) return sources.topic();
    return curate(scope, curators.map(id => `~${id}`), true).then(ids =>
      ids.map(thingid => SOULS.thing.soul({ thingid }))
    );
  },
  author: (scope, definition) => {
    const authorIds = keysIn(definition.author).map(id => `~${id}`);
    const type = keysIn(definition.type)[0];
    if (!authorIds) return sources.topic();
    return multiAuthor(scope, { type, authorIds });
  },
  domain: (scope, definition) => {
    const domains = keysIn(definition.domain);
    if (!domains.length) return sources.topic();
    return multiDomain(scope, { domains });
  },
  topic: (scope, definition) => {
    const topics = keysIn(definition.topic);
    if (!topics.length) topics.push("all");
    return multiTopic(scope, { topics });
  }
};

export const parseListingDescription = description =>
  description.split("\n").reduce((def, line) => {
    const tokens = line
      .trim()
      .split(" ")
      .map(trim)
      .filter(x => x);
    if (!tokens.length) return def;
    return assocPath(tokens, {}, def);
  }, {});

export const declarativeListing = query((scope, description) => {
  const definition = parseListingDescription(description);
  const isPresent = p => {
    let check = p;
    if (typeof p === "string") check = p.split(" ");
    return !!(check && path(check, definition));
  };
  const source = keysIn(sources).find(isPresent) || "topic";
  const sort = keysIn(definition.sort)[0] || "new";
  const tabulator = `~${keysIn(definition.sort)[0]}`;
  let name = keysIn(definition.name)[0];
  let submitTopic = keysIn(path(["submit", "to"], definition))[0] || "";
  const curators = keysIn(definition.curator);
  const censors = keysIn(definition.censor);
  const opId = keysIn(definition.op)[0];

  // these bits are not yet implemented
  // eslint-disable-next-line
  const needsData = !![
    source !== "topic" ? ["topic"] : null,
    source !== "domain" ? ["domain"] : null,
    source !== "author" ? ["author"] : null,
    ["ban", "domain"],
    ["ban", "topic"],
    ["ban", "author"],
    ["ban", "alias"]
  ].find(isPresent);

  // eslint-disable-next-line
  const needsScores = !![
    ["sort", "hot"],
    ["sort", "top"],
    ["sort", "best"],
    ["sort", "controversial"],
    ["ups"],
    ["downs"],
    ["score"]
  ].find(isPresent);

  return sources[source](scope, definition)
    .then(thingSouls => {
      if (opId) {
        return scope.get(SOULS.thingData.soul({ thingid: opId })).then(data => {
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
    .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator }))
    .then(things => censor(scope, censors.map(id => `~${id}`), things))
    .then(things => things.slice(0, LISTING_SIZE))
    .then(things => serializeListing({ name, things }))
    .then(serialized => ({
      ...serialized,
      submitTopic,
      includeRanks: isPresent(["show", "ranks"]),
      curators: curators.join(SOUL_DELIMETER),
      censors: censors.join(SOUL_DELIMETER)
    }));
});
