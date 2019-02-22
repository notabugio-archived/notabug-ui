import { basic } from "gun-cleric-scope";
import { oracle } from "gun-cleric";
import { PREFIX } from "../notabug-peer";
import { listingFromPage } from "../listings/declarative";
import { onPutListingHandler as onPutHandler } from "../listings/changes";
import { query } from "gun-scope";

const submissionConfig = sort => ({
  path: `${PREFIX}/things/:thingId/comments/${sort}@~:indexer.`,
  priority: 85,
  throttleGet: 1000 * 60 * 60,
  onPut: onPutHandler(sort),
  query: query((scope, { match: { thingId, indexer } }) =>
    listingFromPage(
      scope,
      indexer,
      "listing:comments",
      [`sort ${sort}`, `op ${thingId}`].join("\n"),
      { useListing: false }
    )
  )
});

export default oracle({
  name: "comments",
  concurrent: 1,
  routes: [
    basic(submissionConfig("best")),
    basic(submissionConfig("new")),
    basic(submissionConfig("top")),
    basic(submissionConfig("hot")),
    basic(submissionConfig("controversial")),
  ]
});
