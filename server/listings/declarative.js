/* globals Promise */
import * as R from "ramda";
import { query } from "gun-scope";
import { routes as souls } from "../notabug-peer/json-schema";
import { getWikiPage } from "../notabug-peer/listings";
import { toFilters } from "../notabug-peer/source";
import {
  LISTING_SIZE,
  censor,
  moderate,
  serialize,
  uniqueByContent
} from "./utils";
import { fetchData } from "./datasources";

export const declarativeListing = query((scope, source) => {
  const definition = toFilters(source);
  const { censors, moderators, stickyIds } = definition;
  let { displayName: name } = definition;
  let submitTopic = definition.submitTopics[0] || "";

  return Promise.all([
    fetchData(scope, definition),
    (() => {
      const opId = definition.filters.allow.ops[0];
      const author = definition.filters.allow.authors[0];
      if (opId) {
        return scope
          .get(souls.Thing.reverse({ thingId: opId }))
          .get("data")
          .then(data => {
            name = name || R.prop("topic", data);
            submitTopic = submitTopic || R.prop("topic", data);
          });
      }
      if (author) {
        return scope.get(`~${author}`).then(meta => {
          name = name || R.propOr("", "alias", meta);
        });
      }
      return Promise.resolve();
    })()
  ])
    .then(
      R.compose(
        R.cond([
          [R.always(definition.uniqueByContent), uniqueByContent],
          [R.always(true), R.identity]
        ]),
        R.filter(definition.thingFilter),
        R.prop(0)
      )
    )
    .then(moderate(scope, moderators.map(id => `~${id}`)))
    .then(censor(scope, censors.map(id => `~${id}`)))
    .then(R.slice(0, LISTING_SIZE))
    .then(things => serialize({ name, things, stickyIds }))
    .then(R.mergeDeepLeft({ source, submitTopic }));
});

export const listingFromPage = query(
  (scope, authorId, name, extra = "", transform = R.identity) =>
    getWikiPage(scope, authorId, name).then(
      R.compose(
        body =>
          declarativeListing(
            scope,
            `${body}
${transform(body)}
# added by indexer
${extra || ""}
sourced from page ${authorId} ${name}
            `
          ),
        R.propOr("", "body")
      )
    )
);
