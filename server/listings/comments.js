import { propOr } from "ramda";
import * as SOULS from "../notabug-peer/souls";
import { query } from "../notabug-peer/scope";
import { PREFIX } from "../notabug-peer/util";
import { sortThings } from "../queries";
import { serializeListing } from "./utils";

export const commentsListing = query((scope, { thingid, sort, indexer }) =>
  scope.get(SOULS.thingAllComments.soul({ thingid })).souls()
    .then(souls => [SOULS.thing.soul({ thingid }), ...souls])
    .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${indexer}` }))
    .then(things => serializeListing({ things }))
    .then(serialized => scope.get(SOULS.thingData.soul({ thingid })).then(data => ({
      ...serialized,
      opId: thingid,
      includeRanks: false,
      name: propOr("", "topic", data),
      submitTopic: propOr("whatever", "topic", data),
      tabs: [`${PREFIX}/things/${thingid}/comments/${sort}@~${indexer}.`]
    })))
);
