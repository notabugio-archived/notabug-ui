import * as SOULS from "../notabug-peer/souls";
import { query } from "../notabug-peer/scope";
import { PREFIX, SOUL_DELIMETER } from "../notabug-peer/util";
import { sortThings } from "../queries";
import { LISTING_SIZE, censor, curate, serializeListing } from "./utils";

export const curatedListing = query((scope, {
  name, sort, curators, censors, submitTopic, indexer, includeRanks = true
}) =>
  curate(scope, curators, true)
    .then(ids => ids.map(thingid => SOULS.thing.soul({ thingid })))
    .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${indexer}` }))
    .then(things => censor(scope, censors, things))
    .then(things => serializeListing({ name, things: things.slice(0, LISTING_SIZE) }))
    .then(serialized => ({
      ...serialized, includeRanks, submitTopic,
      curators: curators.map(id => id.replace(/^~/, "")).join(SOUL_DELIMETER),
      censors: curators.map(id => id.replace(/^~/, "")).join(SOUL_DELIMETER),
      tabs: ["hot", "new", "discussed", "controversial", "top", "firehose"]
        .map(tab => `${PREFIX}/t/front/${tab}@~${indexer}.`)
        .join(SOUL_DELIMETER)
    }))
);
