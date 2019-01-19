import { query } from "gun-scope";
import { oracle } from "gun-cleric";
import { basic } from "gun-cleric-scope";
import { PREFIX } from "../notabug-peer";
import { sorts } from "../queries";
import { listingFromPage } from "../listings/declarative";
import { spaceSourceWithDefaults } from "../notabug-peer/source";

export default oracle({
  name: "space-indexer",
  concurrent: 1,
  routes: [
    basic({
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
    })
  ]
});
