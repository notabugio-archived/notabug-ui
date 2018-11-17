import { query } from "../notabug-peer/scope";
import { PREFIX, SOUL_DELIMETER } from "../notabug-peer/util";
import { multiTopic, sortThings } from "../queries";
import { LISTING_SIZE, serializeListing } from "./utils";

export const topicListing = query((scope, { name, topic, sort, indexer }) => {
  const isAbnormal = topic.indexOf(":") !== -1;
  const topics = topic.split("+");
  const normalTopics = topics.filter(t => t && t.indexOf(":") === -1);
  const submitTopic = normalTopics[0] || "whatever";
  return multiTopic(scope, { topics })
    .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${indexer}` }))
    .then(things =>
      serializeListing({ name: name || topic, things: things.slice(0, LISTING_SIZE) }))
    .then(serialized => ({
      ...serialized,
      includeRanks: true,
      submitTopic,
      tabs: ["hot", "new", "discussed", "controversial", "top", ...(isAbnormal ? [] : ["firehose"])]
        .map(tab => `${PREFIX}/t/${topic}/${tab}@~${indexer}.`)
        .join(SOUL_DELIMETER)
    }));
});
