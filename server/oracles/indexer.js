import { prop } from "ramda";
import * as SOULS from "../notabug-peer/souls";
import { query } from "../notabug-peer/scope";
import { PREFIX } from "../notabug-peer/util";
import { sorts, multiTopic, singleAuthor, repliesToAuthor, sortThings } from "../queries";
import { oracle, basicQueryRoute } from "./oracle";

const LISTING_SIZE = 1000;

export default oracle({
  name: "indexer",
  routes: [
    basicQueryRoute({
      path: `${PREFIX}/things/:thingid/comments/:sort@~:tab1.:tab2.`,
      checkMatch: ({ sort }) => (sort in sorts),
      query: query((scope, { match: { thingid: thingid, tab1, tab2, sort } }) =>
        scope.get(SOULS.thingAllComments.soul({ thingid })).souls()
          .then(souls => [SOULS.thing.soul({ thingid }), ...souls])
          .then(thingSouls =>
            sortThings(scope, { sort, thingSouls, tabulator: `~${tab1}.${tab2}` }))
          .then(things => serializeListing({ things })))
    }),

    basicQueryRoute({
      path: `${PREFIX}/domain/:domain/:sort@~:tab1.:tab2.`,
      checkMatch: ({ sort, domain }) =>
        (sort in sorts) && domain && (domain.toLowerCase() === domain),
      query: query((scope, { match: { domain, tab1, tab2, sort } }) =>
        scope.get(SOULS.domain.soul({ domain })).souls()
          .then(thingSouls =>
            sortThings(scope, { sort, thingSouls, tabulator: `~${tab1}.${tab2}` }))
          .then(things => serializeListing({ title: domain, things: things.slice(0, LISTING_SIZE) })))
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/:topic/:sort@~:tab1.:tab2.`,
      checkMatch: ({ sort, topic }) => (sort in sorts) && topic && (topic.toLowerCase() === topic),
      query: query((scope, { match: { topic, sort, tab1, tab2 } }) =>
        multiTopic(scope, { topics: topic.split("+") })
          .then(thingSouls =>
            sortThings(scope, { sort, thingSouls, tabulator: `~${tab1}.${tab2}` }))
          .then(things => serializeListing({ title: topic, things: things.slice(0, LISTING_SIZE) })))
    }),

    basicQueryRoute({
      path: `${PREFIX}/user/:authorId/replies/:type/:sort@~:tab1.:tab2.`,
      checkMatch: ({ sort, type, authorId }) =>
        (sort in sorts) && authorId && type  && type.toLowerCase() == type &&
        (type === "overview" || type === "submitted" || type === "comments"),
      query: query((scope, { match: { authorId, type, sort, tab1, tab2 } }) =>
        repliesToAuthor(
          scope,
          { repliesToAuthorId: authorId ? `~${authorId}` : null, type }
        )
          .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${tab1}.${tab2}` }))
          .then(things => serializeListing({ things: things.slice(0, LISTING_SIZE) })))
    }),

    basicQueryRoute({
      path: `${PREFIX}/user/:authorId/:type/:sort@~:tab1.:tab2.`,
      checkMatch: ({ sort, type, authorId }) =>
        (sort in sorts) && authorId && type  && type.toLowerCase() == type &&
        (type === "overview" || type === "submitted" || type === "comments"),
      query: query((scope, { match: { authorId, type, sort, tab1, tab2 } }) =>
        singleAuthor(
          scope,
          { authorId: authorId ? `~${authorId}` : null, type }
        )
          .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${tab1}.${tab2}` }))
          .then(things => serializeListing(things.slice(0, LISTING_SIZE))))
    })
  ]
});

const serializeListing = ({ title="", things }) => ({
  title,
  ids: things.map(prop("id")).filter(id => !!id).join("+")
});
