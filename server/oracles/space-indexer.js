import { query } from "../notabug-peer/scope";
import { PREFIX } from "../notabug-peer";
import { sorts } from "../queries";
import { oracle, basicQueryRoute } from "./oracle";
import { listingFromPage } from "../listings/declarative";
import { spaceSourceWithDefaults } from "../notabug-peer/listings";

export default oracle({
  name: "space-indexer",
  concurrent: 1,
  routes: [
    basicQueryRoute({
      path: `${PREFIX}/user/:authorId/spaces/:name/:sort@~:indexer.`,
      priority: 20,
      checkMatch: ({ sort, name, authorId }) =>
        sort in sorts && authorId && name,
      query: query((scope, { match: { authorId, name, sort } }) =>
        listingFromPage(
          scope,
          authorId,
          `space:${name}`,
          `sort ${sort}`,
          source => spaceSourceWithDefaults({ source, owner: authorId, name: name })
        )
      )
    }),

  ]
});
