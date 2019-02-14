import * as R from "ramda";
import { query } from "gun-scope";
import { oracle } from "gun-cleric";
import { routes } from "../notabug-peer/json-schema";
import { basic } from "gun-cleric-scope";
import { PREFIX } from "../notabug-peer";
import { sorts } from "../queries";
import { listingFromPage } from "../listings/declarative";

const binarySearch = async (ids, id, getSortVal) => {
  // based on https://stackoverflow.com/a/29018745
  const insertVal = await getSortVal(id);

  let m = 0;
  let n = ids.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const compareVal = await getSortVal(ids[k]);

    if (insertVal > compareVal) {
      m = k + 1;
    } else if (insertVal < compareVal) {
      n = k - 1;
    } else {
      return k;
    }
  }
  if (m === 0) return 0;
  //if (m >= ids.length - 1) return -1;
  return m - 1;
};

const sortId = (orc, route, sort, thingId) =>
  orc
    .newScope()
    .get(route.soul)
    .then(existing => {
      const scope = orc.newScope();
      const ids = R.propOr("", "ids", existing).split("+");
      const existingIndex = ids.indexOf(thingId);
      const tabulator = `~${orc.pub}`;

      if (existingIndex !== -1) ids.splice(existingIndex, 1);
      return binarySearch(ids, thingId, id =>
        sorts[sort].getValueForId(scope, id, { tabulator })
      )
        .then(bsIndex => {
          if (bsIndex < 0 || bsIndex === existingIndex) return;
          console.log(
            "MOVE",
            sort,
            route.soul,
            thingId,
            existingIndex,
            bsIndex
          );
          ids.splice(bsIndex, 0, thingId);
          route.write({ ids: ids.join("+") });
        })
        .then(() => {
          for (const key in scope.getAccesses()) orc.listen(key, route.soul);
        })
        .catch(e => console.error("error sorting id", e.stack || e));
    });

const onPutHandler = sort => (orc, route, { soul, updatedSoul, diff }) => {
  let thingIds = [];
  try {
    const startedAt = new Date().getTime();
    const scope = orc.newScope();
    const voteCountsMatch = routes.ThingVoteCounts.match(updatedSoul);
    if (voteCountsMatch) thingIds.push(voteCountsMatch.thingId);

    thingIds = thingIds.concat(
      R.compose(
        R.filter(R.identity),
        R.map(
          R.compose(
            R.prop("thingId"),
            soul => routes.Thing.match(soul)
          )
        ),
        R.keys
      )(diff)
    );

    const sortNextId = () => {
      const nextId = thingIds.pop();
      if (!nextId) return Promise.resolve();
      return sortId(orc, route, sort, nextId).then(sortNextId);
    };
    return sortNextId().then(() => {
      const endedAt = new Date().getTime();
      const duration = (endedAt - startedAt) / 1000;
    });
  } catch (e) {
    console.error("onPutHandler error", e.stack || e);
  }
};

const topicConfig = sort => ({
  path: `${PREFIX}/t/:topic/${sort}@~:indexer.`,
  priority: 60,
  throttleGet: 1000 * 60 * 60,
  onPut: onPutHandler(sort),
  checkMatch: ({ topic }) =>
    sort in sorts && topic && topic.toLowerCase() === topic,
  query: query((scope, { match: { topic, indexer } }) => {
    const topics = topic.split("+");
    const submitTo = topics[0] === "all" ? "whatever" : topics[0];
    return listingFromPage(
      scope,
      indexer,
      "listing:topic",
      [
        `name ${topic}`,
        ...topics.map(tp => `topic ${tp}`),
        `submit to ${submitTo}`,
        topic.indexOf(":") === -1 ? "kind submission" : "",
        `sort ${sort}`,
        ...["hot", "new", "discussed", "controversial", "top", "firehose"].map(
          tab => `tab ${tab} /t/${topic}/${tab}`
        )
      ].join("\n"),
      {
        useListing: false
      }
    );
  })
});

const domainConfig = sort => ({
  path: `${PREFIX}/domain/:domain/${sort}@~:indexer.`,
  priority: 25,
  checkMatch: ({ domain }) => domain && domain.toLowerCase() === domain,
  throttleGet: 1000 * 60 * 60,
  onPut: onPutHandler(sort),
  query: query((scope, { match: { domain, indexer } }) =>
    listingFromPage(
      scope,
      indexer,
      "listing:domain",
      [
        `name ${domain}`,
        ...domain.split("+").map(dm => `domain ${dm}`),
        "kind submission",
        `sort ${sort}`,
        ...["hot", "new", "discussed", "controversial", "top"].map(
          tab => `tab ${tab} /domain/${domain}/${tab}`
        )
      ].join("\n"),
      { useListing: false }
    )
  )
});

const submissionConfig = sort => ({
  path: `${PREFIX}/things/:thingid/comments/${sort}@~:indexer.`,
  priority: 85,
  throttleGet: 1000 * 60, // * 60,
  onPut: onPutHandler(sort),
  query: query((scope, { match: { thingid, indexer } }) =>
    listingFromPage(
      scope,
      indexer,
      "listing:comments",
      [`sort ${sort}`, `op ${thingid}`].join("\n"),
      { useListing: false }
    )
  )
});

const throttledTopicConfig = sort => ({
  ...topicConfig(sort),
  priority: 10
});

export default oracle({
  name: "indexer",
  concurrent: 1,
  routes: [
    basic(submissionConfig("best")),
    basic(submissionConfig("new")),
    basic(submissionConfig("top")),
    basic(submissionConfig("hot")),
    basic(submissionConfig("controversial")),

    basic({
      path: `${PREFIX}/t/:topic/chat@~:indexer.`,
      priority: 80,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
      throttleGet: 1000 * 60 * 60,
      onPut: onPutHandler("new"),
      query: query((scope, { match: { topic, indexer } }) => {
        const normalTopics = topic.split("+");
        const submitTopic =
          topic === "all" ? "whatever" : normalTopics[0] || "whatever";
        const topics = normalTopics.reduce(
          (res, topic) => [...res, `chat:${topic}`],
          []
        );
        return listingFromPage(
          scope,
          indexer,
          "listing:chat",
          [
            "sort new",
            `submit to ${submitTopic}`,
            topics.map(topic => `topic ${topic}`),
            ...[
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose"
            ].map(tab => `tab ${tab} /t/${topic}/${tab}`)
          ].join("\n"),
          { useListing: false }
        ).then(serialized => ({ ...serialized, isChat: true }));
      })
    }),

    basic({
      path: `${PREFIX}/t/:topic/firehose@~:indexer.`,
      priority: 75,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
      query: query((scope, { match: { topic, indexer } }) => {
        const normalTopics = topic.split("+");
        const submitTopic =
          topic === "all" ? "whatever" : normalTopics[0] || "whatever";
        const topics = normalTopics.reduce(
          (res, topic) => [...res, topic, `chat:${topic}`, `comments:${topic}`],
          []
        );
        return listingFromPage(
          scope,
          indexer,
          "listing:firehose",
          [
            `name ${topic}`,
            "sort new",
            `submit to ${submitTopic}`,
            `chat in ${submitTopic}`,
            ...topics.map(t => `topic ${t}`),
            ...[
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose"
            ].map(tab => `tab ${tab} /t/${topic}/${tab}`)
          ].join("\n")
        ).then(serialized => ({ ...serialized, isChat: true }));
      })
    }),

    basic(topicConfig("new")),
    basic(throttledTopicConfig("hot")),
    basic(throttledTopicConfig("top")),
    basic(throttledTopicConfig("controversial")),
    basic(throttledTopicConfig("discussed")),
    basic(domainConfig("new")),
    basic(domainConfig("hot")),
    basic(domainConfig("top")),
    basic(domainConfig("controversial")),
    basic(domainConfig("discussed")),

    basic({
      path: `${PREFIX}/user/:authorId/replies/:type/:sort@~:indexer.`,
      priority: 20,
      checkMatch: ({ sort, type, authorId }) =>
        sort in sorts &&
        authorId &&
        type &&
        type.toLowerCase() == type &&
        (type === "overview" || type === "submitted" || type === "comments"),
      query: query((scope, { match: { authorId, type, sort, indexer } }) =>
        listingFromPage(
          scope,
          indexer,
          "listing:inbox",
          [
            `replies to author ${authorId}`,
            `type ${type}`,
            `sort ${sort}`
          ].join("\n")
        )
      )
    }),

    basic({
      path: `${PREFIX}/user/:authorId/:type/:sort@~:indexer.`,
      priority: 30,
      checkMatch: ({ sort, type, authorId }) =>
        sort in sorts &&
        authorId &&
        R.includes(type, ["overview", "submitted", "comments", "commands"]),
      query: query((scope, { match: { authorId, type, sort, indexer } }) =>
        listingFromPage(
          scope,
          indexer,
          "listing:user",
          [
            `type ${type}`,
            `sort ${sort}`,
            `author ${authorId}`,
            ...["overview", "comments", "submitted", "commands"].map(
              tab => `tab ${tab} /user/${authorId}/${tab}`
            )
          ].join("\n"),
          { useListing: false }
        ).then(serialized => ({ ...serialized, userId: authorId }))
      )
    })
  ]
});
