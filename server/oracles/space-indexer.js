import * as R from "ramda";
import { query } from "gun-scope";
import { oracle } from "gun-cleric";
import { basic } from "gun-cleric-scope";
import { PREFIX } from "../notabug-peer";
import { sorts } from "../queries";
import { listingFromPage } from "../listings/declarative";
import { spaceSourceWithDefaults } from "../notabug-peer/source";
import { onPutSpaceHandler } from "../listings/changes";

const spaceConfig = sort => ({
  path: `${PREFIX}/user/:authorId/spaces/:name/${sort}@~:indexer.`,
  priority: 20,
  checkMatch: ({ name, authorId }) => authorId && name,
  throttleGet: 1000 * 60 * 60,
  onPut: onPutSpaceHandler(sort),
  query: query((scope, { match: { authorId, name } }) =>
    console.log("space", authorId, name) || listingFromPage(scope, authorId, `space:${name}`, `sort ${sort}`, {
      transform: source =>
        spaceSourceWithDefaults({ source, owner: authorId, name: name })
    })
  )
});

export default oracle({
  name: "space-indexer",
  concurrent: 1,
  routes: [
    basic(spaceConfig("new")),
    basic(spaceConfig("hot")),
    basic(spaceConfig("top")),
    basic(spaceConfig("controversial")),
    basic(spaceConfig("discussed"))
  ]
});
