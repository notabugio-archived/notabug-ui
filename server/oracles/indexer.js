import { query } from "../notabug-peer/scope";
import { PREFIX } from "../notabug-peer";
import { sorts } from "../queries";
import { oracle, basicQueryRoute } from "./oracle";
import { listingFromPage } from "../listings/declarative";

export default oracle({
  name: "indexer",
  concurrent: 1,
  routes: [
    basicQueryRoute({
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

    basicQueryRoute({
      path: `${PREFIX}/t/:topic/chat@~:indexer.`,
      priority: 80,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
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
          ].join("\n")
        ).then(serialized => ({ ...serialized, isChat: true }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/things/:thingid/comments/:sort@~:indexer.`,
      checkMatch: ({ sort }) => sort in sorts,
      priority: 85,
      query: query((scope, { match: { thingid, sort, indexer } }) =>
        listingFromPage(
          scope,
          indexer,
          "listing:comments",
          [`sort ${sort}`, `op ${thingid}`].join("\n")
        )
      )
    }),

    basicQueryRoute({
      path: `${PREFIX}/domain/:domain/:sort@~:indexer.`,
      priority: 25,
      checkMatch: ({ sort, domain }) =>
        sort in sorts && domain && domain.toLowerCase() === domain,
      query: query((scope, { match: { domain, sort, indexer } }) =>
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
          ].join("\n")
        )
      )
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/:topic/:sort@~:indexer.`,
      priority: 60,
      checkMatch: ({ sort, topic }) =>
        sort in sorts && topic && topic.toLowerCase() === topic,
      query: query((scope, { match: { topic, sort, indexer } }) => {
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
            ...[
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose"
            ].map(tab => `tab ${tab} /t/${topic}/${tab}`)
          ].join("\n")
        );
      })
    }),

    basicQueryRoute({
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

    basicQueryRoute({
      path: `${PREFIX}/user/:authorId/:type/:sort@~:indexer.`,
      priority: 30,
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
          "listing:user",
          [
            `type ${type}`,
            `sort ${sort}`,
            `author ${authorId}`,
            ...["overview", "comments", "submitted"].map(
              tab => `tab ${tab} /user/${authorId}/${tab}`
            )
          ].join("\n")
        ).then(serialized => ({ ...serialized, userId: authorId }))
      )
    })
  ]
});
