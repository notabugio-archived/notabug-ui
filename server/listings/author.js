import { propOr } from "ramda";
import { query, all } from "../notabug-peer/scope";
import { PREFIX, SOUL_DELIMETER } from "../notabug-peer/util";
import { singleAuthor, repliesToAuthor, sortThings } from "../queries";
import { LISTING_SIZE, serializeListing } from "./utils";

export const authorListing = query((scope, { authorId, type, sort, indexer }) =>
  all([
    singleAuthor(scope, { authorId: authorId ? `~${authorId}` : null, type })
      .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${indexer}` }))
      .then(things => serializeListing({ things: things.slice(0, LISTING_SIZE) })),
    scope.get(`~${authorId}`).then()
  ]).then(([serialized, meta]) => ({
    ...serialized,
    name: propOr("", "alias", meta),
    userId: authorId,
    tabs: ["overview", "comments", "submitted"]
      .map(tab => `${PREFIX}/user/${authorId}/${tab}/${sort}@~${indexer}.`)
      .join(SOUL_DELIMETER)
  })));

export const authorReplies = query((scope, { authorId, type, sort, indexer }) =>
  repliesToAuthor(scope, { repliesToAuthorId: authorId ? `~${authorId}` : null, type })
    .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${indexer}` }))
    .then(things => serializeListing({ things: things.slice(0, LISTING_SIZE) }))
    .then(serialized => ({ ...serialized, name: "message" })));
