import * as R from "ramda";
import { query } from "gun-scope";
import { oracle } from "gun-cleric";
import { routes } from "../notabug-peer/json-schema";
import { basic } from "gun-cleric-scope";
import { PREFIX } from "../notabug-peer";
import { sorts } from "../queries";
import { listingFromPage } from "../listings/declarative";
import { onPutRepliesHandler, onPutSpaceHandler, onPutListingHandler as onPutHandler } from "../listings/changes";

const topicConfig = sort => ({
  path: `${PREFIX}/t/:topic/${sort}@~:indexer.`,
  priority: 60,
  throttleGet: 1000 * 60 * 60 * 8,
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
  throttleGet: 1000 * 60 * 60 * 8,
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
  path: `${PREFIX}/things/:thingId/comments/${sort}@~:indexer.`,
  priority: 85,
  throttleGet: 1000 * 60 * 60 * 8,
  onPut: onPutHandler(sort),
  query: query((scope, { match: { thingId, indexer } }) =>
    listingFromPage(
      scope,
      indexer,
      "listing:comments",
      [`sort ${sort}`, `op ${thingId}`].join("\n"),
      { useListing: false }
    )
  )
});

const userConfig = sort => ({
  path: `${PREFIX}/user/:authorId/:type/${sort}@~:indexer.`,
  priority: 30,
  checkMatch: ({ type, authorId }) =>
    authorId &&
    R.includes(type, ["overview", "submitted", "comments", "commands"]),
  throttleGet: 1000 * 60 * 60 * 8,
  onPut: onPutHandler(sort),
  query: query((scope, { match: { authorId, type, indexer } }) =>
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
});

export default oracle({
  name: "indexer",
  concurrent: 1,
  routes: [
    basic({
      path: `${PREFIX}/t/:topic/chat@~:indexer.`,
      priority: 80,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
      throttleGet: 1000 * 60 * 60 * 8,
      onPut: onPutSpaceHandler("new"),
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

    basic({
      path: `${PREFIX}/t/:topic/firehose@~:indexer.`,
      priority: 75,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
      throttleGet: 1000 * 60 * 60 * 8,
      onPut: onPutSpaceHandler("new"),
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
    basic(topicConfig("hot")),
    basic(topicConfig("top")),
    basic(topicConfig("controversial")),
    basic(topicConfig("discussed")),
    basic(domainConfig("new")),
    basic(domainConfig("hot")),
    basic(domainConfig("top")),
    basic(domainConfig("controversial")),
    basic(domainConfig("discussed")),

    basic({
      path: `${PREFIX}/user/:authorId/replies/:type/new@~:indexer.`,
      priority: 20,
      checkMatch: ({ type, authorId }) =>
        authorId &&
        type &&
        type.toLowerCase() == type &&
        (type === "overview" || type === "submitted" || type === "comments"),
      onPut: onPutRepliesHandler("new"),
      query: query((scope, { match: { authorId, type, sort, indexer } }) =>
        listingFromPage(
          scope,
          indexer,
          "listing:inbox",
          [
            `replies to author ${authorId}`,
            `type ${type}`,
            "sort new"
          ].join("\n")
        )
      )
    }),

    basic({
      path: `${PREFIX}/user/:authorId/commented/:sort@~:indexer.`,
      priority: 20,
      checkMatch: ({ sort, authorId }) =>
        sort in sorts &&
        authorId,
      query: query((scope, { match: { authorId, type, sort, indexer } }) =>
        listingFromPage(
          scope,
          indexer,
          "listing:inbox",
          [
            `curator ${authorId}`,
            `sort ${sort}`
          ].join("\n"),
          { useListing: false }
        )
      )
    }),

    basic(userConfig("new")),
    basic(userConfig("hot")),
    basic(userConfig("top")),
    basic(userConfig("controversial")),
    basic(userConfig("discussed"))
  ]
});
