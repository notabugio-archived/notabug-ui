import * as R from "ramda";
import { query } from "gun-scope";
import { oracle } from "gun-cleric";
import { basic } from "gun-cleric-scope";
import { PREFIX } from "../notabug-peer";
import { sorts } from "../queries";
import { listingFromPage } from "../listings/declarative";
import { spaceSourceWithDefaults } from "../notabug-peer/source";

const spaceConfig = sort => ({
  path: `${PREFIX}/user/:authorId/spaces/:name/${sort}@~:indexer.`,
  priority: 20,
  checkMatch: ({ name, authorId }) => authorId && name,
  query: query((scope, { match: { authorId, name } }) =>
    listingFromPage(scope, authorId, `space:${name}`, `sort ${sort}`, {
      transform: source =>
        spaceSourceWithDefaults({ source, owner: authorId, name: name })
    })
  )
});

const throttledSpaceConfig = sort => ({
  ...spaceConfig(sort),
  priority: 10,
  throttleGet: 2 * 60 * 1000,
  onPut: R.always(Promise.resolve())
});

export default oracle({
  name: "space-indexer",
  concurrent: 1,
  routes: [
    basic(spaceConfig("new")),
    basic(throttledSpaceConfig("hot")),
    basic(throttledSpaceConfig("top")),
    basic(throttledSpaceConfig("controversial")),
    basic(throttledSpaceConfig("discussed"))
  ]
});
