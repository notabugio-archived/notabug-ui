import { query } from "../notabug-peer/scope";
import * as SOULS from "../notabug-peer/souls";
import { PREFIX, SOUL_DELIMETER } from "../notabug-peer/util";
import { sortThings } from "../queries";
import { LISTING_SIZE, serializeListing } from "./utils";

export const domainListing = query((scope, { domain, sort, indexer }) =>
  scope
    .get(SOULS.domain.soul({ domain }))
    .souls()
    .then(thingSouls =>
      sortThings(scope, { sort, thingSouls, tabulator: `~${indexer}` })
    )
    .then(things =>
      serializeListing({
        name: domain,
        things: things.slice(0, LISTING_SIZE)
      })
    )
    .then(serialized => ({
      ...serialized,
      includeRanks: true,
      submitTopic: "whatever",
      tabs: ["hot", "new", "discussed", "controversial", "top"]
        .map(tab => `${PREFIX}/domain/${domain}/${tab}@~${indexer}.`)
        .join(SOUL_DELIMETER)
    }))
);
