import { prop } from "ramda";
import { query } from "../notabug-peer/scope";
import { PREFIX, SOUL_DELIMETER } from "../notabug-peer";
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
      path: `${PREFIX}/t/:topic/firehose@~:id1.:id2.`,
      priority: 75,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
      query: query((scope, { match: { topic, id1, id2 } }) => {
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
              tabulator: `~${id1}.${id2}`
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
            tabs: [
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose"
            ]
              .map(tab => `${PREFIX}/t/${topic}/${tab}@~${id1}.${id2}.`)
              .join(SOUL_DELIMETER)
          }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/:topic/chat@~:id1.:id2.`,
      priority: 80,
      checkMatch: ({ topic }) =>
        topic && topic.toLowerCase() === topic && topic.indexOf(":") === -1,
      query: query((scope, { match: { topic, id1, id2 } }) => {
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
              tabulator: `~${id1}.${id2}`
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
            tabs: [
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose",
              "chat"
            ]
              .map(tab => `${PREFIX}/t/${topic}/${tab}@~${id1}.${id2}.`)
              .join(SOUL_DELIMETER)
          }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/curated/:sort@~:indexer.`,
      priority: 25,
      checkMatch: ({ sort }) => sort in sorts,
      query: query((scope, { match: { sort, indexer } }) =>
        listingFromPage(scope, indexer, "listing:curated", `kind submission\nsort ${sort}`).then(
          serialized => ({
            ...serialized,
            tabs: ["hot", "new", "discussed", "controversial", "top"]
              .map(tab => `${PREFIX}/t/curated/${tab}@~${indexer}.`)
              .join(SOUL_DELIMETER)
          })
        )
      )
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/front/:sort@~:indexer.`,
      priority: 25,
      checkMatch: ({ sort }) => sort in sorts,
      query: query((scope, { match: { sort, indexer } }) =>
        listingFromPage(scope, indexer, "listing:front", `kind submission\nsort ${sort}`).then(
          serialized => ({
            ...serialized,
            tabs: [
              "hot",
              "new",
              "discussed",
              "controversial",
              "top",
              "firehose"
            ]
              .map(tab => `${PREFIX}/t/front/${tab}@~${indexer}.`)
              .join(SOUL_DELIMETER)
          })
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
          "listing:default",
          [`sort ${sort}`, `op ${thingid}`].join("\n")
        ).then(serialized => ({
          ...serialized,
          opId: thingid,
          tabs: [`${PREFIX}/things/${thingid}/comments/${sort}@~${indexer}.`]
        }))
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
          "listing:default",
          [
            `name ${domain}`,
            ...domain.split("+").map(dm => `domain ${dm}`),
            `kind submission\nsort ${sort}`
          ].join("\n")
        ).then(serialized => ({
          ...serialized,
          tabs: ["hot", "new", "discussed", "controversial", "top"]
            .map(
              tab => `${PREFIX}/domain/${domain}/${tab}@~${indexer}.${indexer}.`
            )
            .join(SOUL_DELIMETER)
        }))
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
          "listing:default",
          [
            `name ${topic}`,
            ...topics.map(tp => `topic ${tp}`),
            `submit to ${submitTo}`,
            "kind submission",
            `sort ${sort}`
          ].join("\n")
        ).then(serialized => ({
          ...serialized,
          tabs: ["hot", "new", "discussed", "controversial", "top", "firehose"]
            .map(tab => `${PREFIX}/t/${topic}/${tab}@~${indexer}.`)
            .join(SOUL_DELIMETER)
        }));
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
          "listing:default",
          [
            "name message",
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
          "listing:default",
          [`type ${type}`, `sort ${sort}`, `author ${authorId}`].join("\n")
        ).then(serialized => ({
          ...serialized,
          userId: authorId,
          tabs: ["overview", "comments", "submitted"]
            .map(
              tab => `${PREFIX}/user/${authorId}/${tab}/${sort}@~${indexer}.`
            )
            .join(SOUL_DELIMETER)
        }))
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
