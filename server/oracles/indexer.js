import { prop, propOr, uniq, map, filter, compose } from "ramda";
import * as SOULS from "../notabug-peer/souls";
import { query, all } from "../notabug-peer/scope";
import { PREFIX, SOUL_DELIMETER } from "../notabug-peer/util";
import { filterThings, sorts, multiTopic, multiAuthor, singleAuthor, repliesToAuthor, sortThings } from "../queries";
import { oracle, basicQueryRoute } from "./oracle";

const LISTING_SIZE = 1000;

const FRONTPAGE_TOPICS = [
  "art",
  "ask",
  "books",
  "food",
  "funny",
  "gaming",
  "gifs",
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


const CURATOR_IDS = uniq([
  "~5vvQz9CTQgpk4alXuJIiHeTBRt4itoueqrHs-Fi0X7A.1iY7DRla-NvhahUszYZCgxXUnMcoLPGlLTU1ldBqINE",
  "~LesDWK7BcLGNLAtzyAWVwuELI8NKLudyX2E-68OLek4.A8owpiqmANc6yN5fD7UfwSz9kWsRVgBx4obwuCBo6H8",
  "~7MMrduZa7qNfw2IrmPH01_AVFwruIOs1lP84syULyuA.qXSQ4LJq-MneJL-NY55urDPOucT3p5IxtL2Hr2cZtt8",
  "~GnKvWZEoLdXqQKIGMSKJeQQmV57QK85SOLa9DP3rvm4.icZFh-IVnGpRSfoCk_GjBE3mjmHtwCdWgN974DR3_AA",
  "~Yr3T3rFJacNpTwRCue6tEvmajAjuvNkRCTcHz6HsLlU.THENQfgvkmTKSmOGsVSsS63qaIL8eGFWFfzgNh6zv5o",
  "~YOfauvxM4twU4ODt8Nglmtf6OuF4HFM0Jb7qEnqYPy8.5v2LSnhFHzUHGC8OQ237Zkm2I669k4_Gy5kE9lKVLmw",
  "~6CGHfCjVF-PLjEkFTDazpVkdD7-qi2lA59grir4Ws64.wOsmeMAp7-Gcq_yTButNeKtinqy-ovNIRBSTUK03WVI",
  "~0R5jFQNX4ff0gYPQwqg67qV8rmNLjp2gqyc7lkmvpSY.5lupP8_MAS3rIkdcPv9AiWZ93KcGD4zTSoPKn4nNI4k",
  "~7Cm8-PUuhI2Wr5csnZxBVTMyE9z93LEIBcL8cW606Qg.bO915baqt4Mkx4N7bLeY-QnKIVTTOTUPdbQTbbo9TFA",
  "~EhXn9ob_AgV1w4499yRvEfUrMwwKIw-d3cHWuYAU5Lg.X45TijFVuMrdCN4NYtIiv7Pg_q2V8mvyhVzKlbT72cs",
  "~Buttb_yRAGNze8rVzo3m8eIhHYjXBgnxLq5JoIfZvhg.v6BEyy-l7zoMS88lkgR4EA5Hf4UTS3tmV_VE2cSdxKs",
  "~nXqxE4xmS2kww5mMQyrmJS_JSXn6Gur7VpscFIIf7hs.bpYbA-2wiQ6MENssj8YDKlAP_hQEZ0LFF4mO6DyMQbM",
  "~IqcjVSC34GtFs5w59N9kASBbdZKCgHKiQwFFRym9Pr4.8n1bLKu2IXPe3aziyfkDNNo0gsi3reOk1DHSx6DHATs",
  "~XHzMA_zabEhwnXYHLaeYyiTdm-Xt4FgWRFuFvwf3hn8.UCNN7-8cd-TMKAB92-ROChYL7tYZBPlvjAUOIxOUAmA",
  "~UaWOVCZeTRlFbZs0K8LQM21rkNp2zvXdlLtA011thn0.gWyK6Zodeo43aIQubLlMIY_ByoMtm1gNH5hzwdi6oNI",
  "~NGr7RVDtyQLgP9r9qm04Crz_MxloYlOr3ZpmWYi0Q-s.iVqFivkVC_dNm_wZ_oCP91rVreB4DTQLV2n6JAeYJgo",
  "~zVAX29cFhylCtkPd0pLOThTWo-vCoeSKEoECMNMAEJM.d_QkGhisTbRStaTbHDEtHjs1Vq1aB_qFIPC0DXBbULc",
  "~EB2a-VBhZPhPHFG2ga_-MbzE-6G_24aTjK5D3dbu8VQ.xGruTslH7eDVi10jeVY9rEHMudBUp5pfChjpyUd2cBw",
  "~mqsUTvuTU43E3vdKWqWb0bL4ulETedy2kdkPjQr5Zpk.KKNTLAMcfSGXO5Xq7K7XpwDWwiXahkNxKbhkab2-o04",
  "~r7k5HvzU8EzXcN_5NUcBecO3ZltdBEYZ9r6CX-UwbRk.4H4IjbanOiRImfyzWU5Zn4-asLd5SSO_PJmv_VPt4tU",
  "~VPJPmDnVzi70la1dtvN9YNHIUyPWIkbH-iR8qDotHfY.6KXh-Kg2-l8ZEH65OsMS6yBSip8HuJvb9rhfR9c_eK4",
  "~qCS827OtiqrnCYuhDDscIaUH-b1Zf4ARqC75TQdveno.mtUOCBbbkrExAec0K5Bmb4d5SJ14ruGPaJBETtYucv0",
  "~OpiwW6J7dHN0yrqXKK0hISsM4nJgrcXOPdW7Vwwr0uU.8raor7BxnatrzwISF7xSmCTb9Cgd0IgkQCL--BpWZG0",
  "~6xze5qBkwMey6_5K99bttcFb9ylII1UN2mdSeb55elk.7zqXfUVf75CVJuqEUQ_NSN-qTqu1wQ53svNWvFg5gJ4",
  "~VqbAno4if8ucqBGK2CRHXzAEDPXlWYmBW709CsRUn4U.sorgqKUe-92XX1gXcznqaGuNtv1V05Zy1R2EN3vqW0I",
]);

const CENSOR_IDS = [
  "~Wca7b2b7PnXacwBALo28ICWt9Czgy28LOuHES-Avd8c.BgmQH_1XTPqel7H16TJ64poUsh0Cg1tIxHbKN2tf1as"
];

const curate = query((scope, authorIds, submissionOnly = false) =>
  all([
    multiAuthor(
      scope,
      {
        type: "comments",
        authorIds: authorIds
      }
    )
      .then(souls => all(souls.filter(x => !!x).map(soul => scope.get(`${soul}/data`).then(x => x))))
      .then(compose(
        map(prop("replyToId")),
        filter(itemData => {
          if (!itemData) return;
          if (submissionOnly && itemData.opId !== itemData.replyToId) return;
          return !!itemData.replyToId;
        })
      )),
    multiAuthor(
      scope,
      {
        type: "submitted",
        authorIds: authorIds
      }
    )
      .then(map(soul => SOULS.thing.isMatch(soul).thingid))
  ]).then(([ids1, ids2]) => uniq([...ids1, ...ids2]))
);

const censor = (scope, things) =>
  curate(scope, CENSOR_IDS)
    .then(ids => {
      const bad = {};
      ids.forEach(id => bad[id] = true);
      return bad;
    })
    .then(badIds => filterThings(scope, things, thing => {
      if (!thing.data) return false;
      if (badIds[thing.id]) return false;
      if (badIds[thing.data.opId]) return false;
      return true;
    }));

export default oracle({
  name: "indexer",
  concurrent: 1,
  routes: [
    basicQueryRoute({
      path: `${PREFIX}/t/:topic/firehose@~:id1.:id2.`,
      priority: 75,
      checkMatch: ({ topic }) => topic && (topic.toLowerCase() === topic) && topic.indexOf(":") === -1,
      query: query((scope, { match: { topic, id1, id2 } }) => {
        const normalTopics = topic === "front" ? FRONTPAGE_TOPICS : topic.split("+");
        const submitTopic = (topic === "front" || topic === "all") ? "whatever" : normalTopics[0] || "whatever";
        const topics = normalTopics.reduce((res, topic) =>
          [ ...res, topic, `chat:${topic}`, `comments:${topic}`], []);
        return multiTopic(scope, { topics })
          .then(thingSouls =>
            sortThings(scope, { sort: "new", thingSouls, tabulator: `~${id1}.${id2}` }))
          .then(things => serializeListing({ name: topic, things: things.slice(0, LISTING_SIZE) }))
          .then(serialized => ({
            ...serialized,
            includeRanks: false,
            submitTopic,
            isChat: true,
            censors: "",
            tabs: ["hot", "new", "discussed", "controversial", "top", "firehose"]
              .map(tab => `${PREFIX}/t/${topic}/${tab}@~${id1}.${id2}.`)
              .join(SOUL_DELIMETER)
          }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/:topic/chat@~:id1.:id2.`,
      priority: 80,
      checkMatch: ({ topic }) => topic && (topic.toLowerCase() === topic) && topic.indexOf(":") === -1,
      query: query((scope, { match: { topic, id1, id2 } }) => {
        const normalTopics = topic === "front" ? FRONTPAGE_TOPICS : topic.split("+");
        const submitTopic = (topic === "front" || topic === "all") ? "whatever" : normalTopics[0] || "whatever";
        const topics = normalTopics.reduce((res, topic) =>
          [ ...res, `chat:${topic}`], []);
        return multiTopic(scope, { topics })
          .then(thingSouls =>
            sortThings(scope, { sort: "new", thingSouls, tabulator: `~${id1}.${id2}` }))
          .then(things => serializeListing({ name: topic, things: things.slice(0, LISTING_SIZE) }))
          .then(serialized => ({
            ...serialized,
            includeRanks: false,
            submitTopic,
            isChat: true,
            censors: "",
            tabs: ["hot", "new", "discussed", "controversial", "top", "firehose", "chat"]
              .map(tab => `${PREFIX}/t/${topic}/${tab}@~${id1}.${id2}.`)
              .join(SOUL_DELIMETER)
          }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/front/:sort@~:id1.:id2.`,
      priority: 25,
      checkMatch: ({ sort }) => (sort in sorts),
      query: query((scope, { match: { sort, id1, id2 } }) =>
        curate(scope, CURATOR_IDS, true)
          .then(ids => ids.map(thingid => SOULS.thing.soul({ thingid })))
          .then(thingSouls =>
            sortThings(scope, { sort, thingSouls, tabulator: `~${id1}.${id2}` }))
          .then(things => censor(scope, things))
          .then(things => serializeListing({ name: "front", things: things.slice(0, LISTING_SIZE) }))
          .then(serialized => ({
            ...serialized,
            includeRanks: true,
            submitTopic: "whatever",
            curators: CURATOR_IDS.map(id => id.replace(/^~/, "")).join(SOUL_DELIMETER),
            censors: CENSOR_IDS.map(id => id.replace(/^~/, "")).join(SOUL_DELIMETER),
            tabs: ["hot", "new", "discussed", "controversial", "top", "firehose"]
              .map(tab => `${PREFIX}/t/front/${tab}@~${id1}.${id2}.`)
              .join(SOUL_DELIMETER)
          })))
    }),

    basicQueryRoute({
      path: `${PREFIX}/things/:thingid/comments/:sort@~:id1.:id2.`,
      checkMatch: ({ sort }) => (sort in sorts),
      priority: 85,
      query: query((scope, { match: { thingid, id1, id2, sort } }) =>
        scope.get(SOULS.thingAllComments.soul({ thingid })).souls()
          .then(souls => [SOULS.thing.soul({ thingid }), ...souls])
          .then(thingSouls =>
            sortThings(scope, { sort, thingSouls, tabulator: `~${id1}.${id2}` }))
          .then(things => serializeListing({ things }))
          .then(serialized => scope.get(SOULS.thingData.soul({ thingid }))
            .then(data => ({
              ...serialized,
              name: propOr("", "topic", data),
              opId: thingid,
              submitTopic: propOr("whatever", "topic", data),
              includeRanks: false,
              tabs: [`${PREFIX}/things/${thingid}/comments/${sort}@~${id1}.${id2}.`]
            }))))
    }),

    basicQueryRoute({
      path: `${PREFIX}/domain/:domain/:sort@~:id1.:id2.`,
      priority: 25,
      checkMatch: ({ sort, domain }) =>
        (sort in sorts) && domain && (domain.toLowerCase() === domain),
      query: query((scope, { match: { domain, id1, id2, sort } }) =>
        scope.get(SOULS.domain.soul({ domain })).souls()
          .then(thingSouls =>
            sortThings(scope, { sort, thingSouls, tabulator: `~${id1}.${id2}` }))
          .then(things => serializeListing({ name: domain, things: things.slice(0, LISTING_SIZE) }))
          .then(serialized => ({
            ...serialized,
            includeRanks: true,
            submitTopic: "whatever",
            tabs: ["hot", "new", "discussed", "controversial", "top"]
              .map(tab => `${PREFIX}/domain/${domain}/${tab}@~${id1}.${id2}.`)
              .join(SOUL_DELIMETER)
          })))
    }),

    basicQueryRoute({
      path: `${PREFIX}/t/:topic/:sort@~:id1.:id2.`,
      priority: 60,
      checkMatch: ({ sort, topic }) => (sort in sorts) && topic && (topic.toLowerCase() === topic),
      query: query((scope, { match: { topic, sort, id1, id2 } }) => {
        const isAbnormal = topic.indexOf(":") !== -1;
        const topics = topic.split("+");
        const normalTopics = topics.filter(t => t && t.indexOf(":") === -1);
        const submitTopic = normalTopics[0] || "whatever";
        return multiTopic(scope, { topics })
          .then(thingSouls =>
            sortThings(scope, { sort, thingSouls, tabulator: `~${id1}.${id2}` }))
          .then(things => serializeListing({ name: topic, things: things.slice(0, LISTING_SIZE) }))
          .then(serialized => ({
            ...serialized,
            includeRanks: true,
            submitTopic,
            tabs: ["hot", "new", "discussed", "controversial", "top", ...(isAbnormal ? [] : ["firehose"])]
              .map(tab => `${PREFIX}/t/${topic}/${tab}@~${id1}.${id2}.`)
              .join(SOUL_DELIMETER)
          }));
      })
    }),

    basicQueryRoute({
      path: `${PREFIX}/user/:authorId/replies/:type/:sort@~:id1.:id2.`,
      priority: 20,
      checkMatch: ({ sort, type, authorId }) =>
        (sort in sorts) && authorId && type  && type.toLowerCase() == type &&
        (type === "overview" || type === "submitted" || type === "comments"),
      query: query((scope, { match: { authorId, type, sort, id1, id2 } }) =>
        repliesToAuthor(
          scope,
          { repliesToAuthorId: authorId ? `~${authorId}` : null, type }
        )
          .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${id1}.${id2}` }))
          .then(things => serializeListing({ things: things.slice(0, LISTING_SIZE) }))
          .then(serialized => ({
            ...serialized,
            name: "message"
          })))
    }),

    basicQueryRoute({
      path: `${PREFIX}/user/:authorId/:type/:sort@~:id1.:id2.`,
      priority: 30,
      checkMatch: ({ sort, type, authorId }) =>
        (sort in sorts) && authorId && type  && type.toLowerCase() == type &&
        (type === "overview" || type === "submitted" || type === "comments"),
      query: query((scope, { match: { authorId, type, sort, id1, id2 } }) =>
        all([
          singleAuthor(
            scope,
            { authorId: authorId ? `~${authorId}` : null, type }
          )
            .then(thingSouls => sortThings(scope, { sort, thingSouls, tabulator: `~${id1}.${id2}` }))
            .then(things => serializeListing({ things: things.slice(0, LISTING_SIZE) })),
          scope.get(`~${authorId}`).then()
        ]).then(([serialized, meta]) => ({
          ...serialized,
          name: propOr("", "alias", meta),
          userId: authorId,
          tabs: ["overview", "comments", "submitted"]
            .map(tab => `${PREFIX}/user/${authorId}/${tab}/${sort}@~${id1}.${id2}.`)
            .join(SOUL_DELIMETER)
        })))
    })
  ]
});

const serializeListing = ({ name="", things }) => ({
  name,
  ids: things.map(prop("id")).filter(id => !!id).join("+")
});
