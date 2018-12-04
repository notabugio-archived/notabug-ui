import Promise from "promise";
import { prop, path, always, keysIn } from "ramda";
import urllite from "urllite";
import { getDayStr } from "./util";
import {
  nodeType,
  allowFields,
  allowSoulFields,
  allowFieldsSEA,
  keyIs,
  valFromSoul,
  isBoolean,
  isSoul,
  isUrl,
  isBlank,
  isTimestamp,
  isNumeric,
  soulMatchesKey,
  maxSize,
  and,
  or
} from "./validation";
import objHash from "object-hash";
import { verifyWork } from "./work";
import * as consts from "./constants";

const { PREFIX } = consts;

// XXX: All exports from this file should be nodeType's

const checkTopicSoulMatch = ({ topicname }) => {
  if (!topicname || typeof topicname !== "string") return false;
  if (topicname.length > consts.MAX_TOPIC_SIZE) return false;
  if (topicname !== topicname.toLowerCase()) return false;
  return true;
};

export const topicDay = nodeType(
  `${PREFIX}/topics/:topicname/days/:year/:month/:day`,
  ({ topicname, year, month, day }) => {
    const iyear = parseInt(year, 10);
    const imonth = parseInt(month, 10);
    const iday = parseInt(day, 10);
    if (!iyear || !imonth || !iday || !topicname) return false;
    const d = new Date(year, month - 1, day);
    if (getDayStr(d) !== `${year}/${month}/${day}`) return false;
    return checkTopicSoulMatch({ topicname });
  },
  allowFields(
    and(keyIs("name"), valFromSoul("topicDay", "topicname")),
    and(isSoul("thing"), soulMatchesKey)
  )
);

export const topicDays = nodeType(
  `${PREFIX}/topics/:topicname/days`,
  checkTopicSoulMatch,
  allowFields(
    and(keyIs("name"), valFromSoul("topicDays", "topicname")),
    and(isSoul("topicDay"), soulMatchesKey)
  )
);

export const topic = nodeType(
  `${PREFIX}/topics/:topicname`,
  checkTopicSoulMatch,
  allowFields(
    and(keyIs("name"), valFromSoul("topic", "topicname")),
    and(isSoul("thing"), soulMatchesKey)
  )
);

export const topics = nodeType(
  `${PREFIX}/topics`,
  always(true),
  allowFields(and(isSoul("topic"), soulMatchesKey))
);

export const domain = nodeType(
  `${PREFIX}/domains/:domain`,
  always(true), // TODO: verify domain structure
  allowFields(and(isSoul("thing"), soulMatchesKey))
);

export const url = nodeType(
  [`${PREFIX}/urls/`, "*url"].join(""),
  match => {
    const urlinfo = urllite(match.url);
    if (urlinfo.host && urlinfo.protocol) return true;
    return false;
  },
  allowFields(and(isSoul("thing"), soulMatchesKey))
);

const checkThingSoulMatch = ({ thingid }) => {
  if (!thingid || typeof thingid !== "string") return false;
  if (thingid.length > consts.MAX_HASH_SIZE) return false;
  return true;
};

export const thingAllComments = nodeType(
  `${PREFIX}/things/:thingid/allcomments`,
  checkThingSoulMatch,
  allowFields(and(isSoul("thing"), soulMatchesKey))
);

export const thingComments = nodeType(
  `${PREFIX}/things/:thingid/comments`,
  checkThingSoulMatch,
  allowFields(and(isSoul("thing"), soulMatchesKey))
);

export const things = nodeType(
  `${PREFIX}/things`,
  always(true),
  allowFields(and(isSoul("thing"), soulMatchesKey))
);

export const pages = nodeType(
  `${PREFIX}/pages`,
  always(true),
  allowFields(and(isSoul("thing"), soulMatchesKey))
);

export const thing = nodeType(
  `${PREFIX}/things/:thingid`,
  checkThingSoulMatch,
  (key, val, parent, pKey, msg, peer) =>
    allowFields(
      and(keyIs("id"), valFromSoul("thing", "thingid")),
      and(keyIs("data"), or(isSoul("thingData"), isSoul("thingDataSigned"))),
      and(keyIs("topic"), isSoul("topic")),
      and(keyIs("domain"), isSoul("domain")),
      and(keyIs("url"), isSoul("url")),
      and(keyIs("comments"), isSoul("thingComments")),
      and(keyIs("allcomments"), isSoul("thingAllComments")),
      and(keyIs("votesup"), isSoul("thingVotes")),
      and(keyIs("votesdown"), isSoul("thingVotes")),
      and(keyIs("op"), isSoul("thing")),
      and(keyIs("replyTo"), isSoul("thing")),
      and(keyIs("kind"), maxSize(consts.MAX_THING_KIND_SIZE)),
      and(keyIs("author"), isSoul("author")),
      and(keyIs("timestamp"), isTimestamp),
      and(keyIs("originalHash"), maxSize(consts.MAX_HASH_SIZE))
    )(key, val, parent, pKey, msg, peer).then(() => {
      const dataSoul = path(["data", "#"], val);
      const isThingData = peer.souls.thingData.isMatch(dataSoul);
      const isThingDataSigned = peer.souls.thingDataSigned.isMatch(dataSoul);
      const id = prop("id", val);
      const originalHash = prop("originalHash", val);
      const authorId =
        (path(["author", "#"], val) || "").substr(1) || undefined;

      const thingid = objHash({
        authorId,
        timestamp: parseInt(prop("timestamp", val)),
        kind: prop("kind", val),
        topic: prop(
          "topicname",
          peer.souls.topic.isMatch(path(["topic", "#"], val))
        ),
        opId: prop("thingid", peer.souls.thing.isMatch(path(["op", "#"], val))),
        replyToId: prop(
          "thingid",
          peer.souls.thing.isMatch(path(["replyTo", "#"], val))
        ),
        originalHash
      });

      if (isThingData && isThingData.thingid && isThingData.thingid === id)
        return val; // legacy

      if (
        isThingData &&
        isThingData.thingid &&
        isThingData.thingid === originalHash
      ) {
        if (id && originalHash && thingid !== id) {
          console.error("meta id doesn't match", id, thingid, msg);
          console.log("val", val);
          delete parent[key];
          return;
        }
        return val;
      }
      if (isThingDataSigned) {
        if (isThingDataSigned.authorId !== authorId) {
          console.warn("author mismatch", val);
          delete parent[key];
          return;
        }
        if (thingid !== id || isThingDataSigned.thingid !== id) {
          console.error(
            "signed meta id doesn't match",
            id,
            thingid,
            isThingDataSigned,
            msg
          );
          delete parent[key];
          return;
        }
        return val;
      }
      if (val.originalHash) console.error("unknown thing?", val);
      delete parent[key];
    })
);

const thingDataFields = [
  and(keyIs("kind"), maxSize(consts.MAX_THING_KIND_SIZE)),
  and(keyIs("title"), maxSize(consts.MAX_THING_TITLE_SIZE)),
  and(keyIs("topic"), maxSize(consts.MAX_TOPIC_SIZE)),
  and(keyIs("body"), maxSize(consts.MAX_THING_BODY_SIZE)),
  and(keyIs("author"), maxSize(consts.MAX_AUTHOR_ALIAS_SIZE)),
  and(keyIs("authorId"), maxSize(consts.MAX_AUTHOR_ID_SIZE)),
  and(keyIs("opId"), maxSize(consts.MAX_HASH_SIZE)),
  and(keyIs("replyToId"), maxSize(consts.MAX_HASH_SIZE)),
  and(keyIs("domain"), maxSize(consts.MAX_DOMAIN_SIZE)),
  and(keyIs("url"), or(isBlank, isUrl)),
  and(keyIs("timestamp"), isTimestamp)
];

const sanitizeThingData = allowFields(...thingDataFields);

export const thingData = nodeType(
  `${PREFIX}/things/:thingid/data`,
  checkThingSoulMatch,
  (key, val, parent, pKey, msg, peer) =>
    sanitizeThingData(key, val, parent, pKey, msg, peer).then(() => {
      const { _, ...record } = val; // eslint-disable-line no-unused-vars
      delete record["#"];

      if (peer.isBlocked(key)) {
        val["url"] = null; // eslint-disable-line
        val["body"] = "[removed]"; // eslint-disable-line
        val["title"] = "[removed]"; // eslint-disable-line
      } else if (keysIn(record).length) {
        const id = objHash(record);
        const match = peer.souls.thingData.isMatch(prop("#", val) || key);
        if (id === match.thingid) return val;
        console.warn("thing data mismatch", id, match.thingid); // eslint-disable-line
        delete parent[key];
      }

      return val;
    })
);

export const thingVotes = nodeType(
  `${PREFIX}/things/:thingid/votes:votekind`,
  checkThingSoulMatch,
  (key, val, parent, pKey, msg, peer) => {
    const match = peer.souls.thingVotes.isMatch(val["#"] || key);
    if (!match) return false;
    return Promise.all(
      keysIn(val).map(vote => {
        if (vote === "#" || vote === "_") return;
        if (
          (val[vote] && val[vote].length > consts.MAX_POW_NONCE_SIZE) ||
          vote.length > consts.MAX_POW_NONCE_SIZE
        ) {
          delete val[vote];
          return Promise.resolve();
        }
        return verifyWork(key, vote).then(isValid => {
          if (isValid) return;
          console.warn("invalid vote", key, vote); // eslint-disable-line
          delete val[voteKey]; // eslint-disable-line
        });
      })
    ).then(() => true);
  }
);

// Signed data

export const thingDataSigned = nodeType(
  `${PREFIX}/things/:thingid/data~:authorId.`,
  checkThingSoulMatch,
  allowFieldsSEA(...thingDataFields)
);

export const userPages = nodeType(
  `${PREFIX}/pages~:authorId.`,
  allowSoulFields(
    and(keyIs("authorId"), maxSize(consts.MAX_AUTHOR_ID_SIZE))
  ),
  allowFieldsSEA(isSoul("thing"))
);

export const author = nodeType(
  "~:authorId",
  ({ authorId }) => !!authorId,
  always(true)
);

// Tabulator data
export const thingVoteCounts = nodeType(
  `${PREFIX}/things/:thingid/votecounts@~:tabulatorId.`,
  checkThingSoulMatch,
  allowFieldsSEA(
    and(keyIs("up"), isNumeric),
    and(keyIs("down"), isNumeric),
    and(keyIs("comment"), isNumeric),
    and(keyIs("score"), isNumeric)
  )
);

// Indexer data
const checkListingSoul = allowSoulFields(
  and(keyIs("prefix"), maxSize(consts.MAX_LISTING_SOUL_PREFIX_SIZE)),
  and(keyIs("identifier"), maxSize(consts.MAX_LISTING_SOUL_IDENTIFIER_SIZE)),
  and(keyIs("tabulatorId"), maxSize(consts.MAX_AUTHOR_ID_SIZE)),
  and(keyIs("sort"), maxSize(consts.MAX_LISTING_SOUL_SORT_SIZE)),
  and(keyIs("type"), maxSize(consts.MAX_LISTING_SOUL_TYPE_SIZE)),
);

const sanitizeListingNode = allowFieldsSEA(
  and(keyIs("name"), maxSize(consts.MAX_TOPIC_SIZE)),
  and(keyIs("ids"), maxSize(consts.MAX_LISTING_IDS_SIZE)),
  and(keyIs("sidebar"), isSoul("thing")),
  and(keyIs("source"), maxSize(consts.MAX_LISTING_SOURCE_SIZE)),

  // These will likely go away in favor of source soon-ish
  and(keyIs("submitTopic"), maxSize(consts.MAX_TOPIC_SIZE)),
  and(keyIs("tabs"), maxSize(consts.MAX_LISTING_TABS_SIZE)),
  and(keyIs("userId"), maxSize(consts.MAX_AUTHOR_ID_SIZE)),
  and(keyIs("opId"), maxSize(consts.MAX_HASH_SIZE)),
  and(keyIs("isChat"), isBoolean),
  and(keyIs("includeRanks"), isBoolean),
);

export const typedListing = nodeType(
  `${PREFIX}/:prefix/:identifier/:type/:sort@~:tabulatorId.`,
  checkListingSoul,
  sanitizeListingNode
);

export const listing = nodeType(
  `${PREFIX}/:prefix/:identifier/:sort@~:tabulatorId.`,
  checkListingSoul,
  sanitizeListingNode
);

export const repliesListing = nodeType(
  `${PREFIX}/:prefix/:identifier/replies/:type/:sort@~:tabulatorId.`,
  checkListingSoul,
  sanitizeListingNode
);

export const genericSignedData = nodeType(
  ":uuid~:authorId.",
  ({ uuid, authorId }) => {
    console.warn(`generic SEA data ${uuid}/~${authorId}.`);
    return (uuid && uuid.length === 20) && authorId && authorId.length < consts.MAX_AUTHOR_ID_SIZE;
  },
  (key) => {
    console.log("genericSignedData", key);
    return true;
  }
);
