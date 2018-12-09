import { prop } from "ramda";
import { query } from "../notabug-peer/scope";
import { PREFIX } from "../notabug-peer";
import { sorts, multiTopic, sortThings } from "../queries";
import { oracle, basicQueryRoute } from "./oracle";
import { listingFromPage } from "../listings/declarative";

const LISTING_SIZE = 1000;

const FRONTPAGE_TOPICS = [
  "art",
  "ask",
  "books",
  "domains",
  "food",
  "funny",
  "gaming",
  "gifs",
  "history",
  "movies",
  "music",
  "news",
  "notabug",
  "pics",
  "politics",
  "programming",
  "religion",
  "quotes",
  "science",
  "space",
  "technology",
  "travel",
  "tv",
  "videos",
  "whatever"
];

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
        const normalTopics =
          topic === "front" ? FRONTPAGE_TOPICS : topic.split("+");
        const submitTopic =
          topic === "front" || topic === "all"
            ? "whatever"
            : normalTopics[0] || "whatever";
        const topics = normalTopics.reduce(
          (res, topic) => [...res, topic, `chat:${topic}`, `comments:${topic}`],
          []
        );
        return multiTopic(scope, { topics, days: 14 })
          .then(thingSouls =>
            sortThings(scope, {
              sort: "new",
              thingSouls,
              tabulator: `~${indexer}`
            })
          )
          .then(things =>
            serializeListing({
              name: topic,
              things: things.slice(0, LISTING_SIZE)
            })
          )
          .then(serialized => ({
            ...serialized,
            includeRanks: false,
            submitTopic,
            isChat: true,
            censors: "",
            tabs: "",
            source: [
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose"
            ]
              .map(tab => `tab ${tab} /t/${topic}/${tab}`)
              .join("\n")
          }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/:topic/chat@~:indexer.`,
      priority: 80,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
      query: query((scope, { match: { topic, indexer } }) => {
        const normalTopics =
          topic === "front" ? FRONTPAGE_TOPICS : topic.split("+");
        const submitTopic =
          topic === "front" || topic === "all"
            ? "whatever"
            : normalTopics[0] || "whatever";
        const topics = normalTopics.reduce(
          (res, topic) => [...res, `chat:${topic}`],
          []
        );
        return multiTopic(scope, { topics, days: 7 })
          .then(thingSouls =>
            sortThings(scope, {
              sort: "new",
              thingSouls,
              tabulator: `~${indexer}`
            })
          )
          .then(things =>
            serializeListing({
              name: topic,
              things: things.slice(0, LISTING_SIZE)
            })
          )
          .then(serialized => ({
            ...serialized,
            includeRanks: false,
            submitTopic,
            isChat: true,
            censors: "",
            tabs: "",
            source: [
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose",
              "chat"
            ]
              .map(tab => `tab ${tab} /t/${topic}/${tab}`)
              .join("\n")
          }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/curated/:sort@~:indexer.`,
      priority: 25,
      checkMatch: ({ sort }) => sort in sorts,
      query: query((scope, { match: { sort, indexer } }) =>
        listingFromPage(
          scope,
          indexer,
          "listing:curated",
          [
            "kind submission",
            `sort ${sort}`,
            ...["hot", "new", "discussed", "controversial", "top"].map(
              tab => `tab ${tab} /t/curated/${tab}`
            )
          ].join("\n")
        )
      )
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/front/:sort@~:indexer.`,
      priority: 25,
      checkMatch: ({ sort }) => sort in sorts,
      query: query((scope, { match: { sort, indexer } }) =>
        listingFromPage(
          scope,
          indexer,
          "listing:front",
          [
            "kind submission",
            `sort ${sort}`,
            ...[
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose"
            ].map(tab => `tab ${tab} /t/front/${tab}`)
          ].join("\n")
        )
      )
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
              tab => `tab ${tab} /user/${authorId}/${tab}/${sort}@~${indexer}.`
            )
          ].join("\n")
        ).then(serialized => ({ ...serialized, userId: authorId }))
      )
    })
  ]
});

const serializeListing = ({ name = "", things }) => ({
  name,
  ids: things
    .map(prop("id"))
    .filter(id => !!id)
    .join("+")
});
