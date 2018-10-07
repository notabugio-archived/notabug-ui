import { prop } from "ramda";
import {
  allowFields, keyIs, valFromSoul, isSoul, soulMatchesKey, and, DEFAULT_POW_COMPLEXITY,
} from "./util";
import objHash from "object-hash";
import pow from "proof-of-work";

export const types = allowFields(
  isSoul("topicDay"),
  isSoul("topicDays"),
  isSoul("topics"),
  isSoul("topic"),
  isSoul("domain"),
  isSoul("url"),
  isSoul("thingData"),
  isSoul("thingVotes"),
  isSoul("thingAllComments"),
  isSoul("thingComments"),
  isSoul("thing"),
  isSoul("things"),
);

export const topic = allowFields(
  and(keyIs("name"), valFromSoul("topic", "topicname")),
  and(isSoul("thing"), soulMatchesKey)
);

export const topicDay = allowFields(
  and(keyIs("name"), valFromSoul("topicDay", "topicname")),
  and(isSoul("thing"), soulMatchesKey)
);

export const topicDays = allowFields(
  and(keyIs("name"), valFromSoul("topicDays", "topicname")),
  and(isSoul("topicDay"), soulMatchesKey)
);

export const topics = allowFields(
  and(isSoul("topic"), soulMatchesKey)
);

export const url = allowFields(
  and(isSoul("thing"), soulMatchesKey)
);

export const domain = allowFields(
  and(isSoul("thing"), soulMatchesKey)
);

export const thingAllComments = allowFields(
  and(isSoul("thing"), soulMatchesKey)
);

export const thingComments = allowFields(
  and(isSoul("thing"), soulMatchesKey)
);

export const thing = allowFields(
  and(keyIs("id"), valFromSoul("thing", "thingid")),
  and(keyIs("data"), isSoul("thingData")),
  and(keyIs("topic"), isSoul("topic")),
  and(keyIs("domain"), isSoul("domain")),
  and(keyIs("url"), isSoul("url")),
  and(keyIs("comments"), isSoul("thingComments")),
  and(keyIs("allcomments"), isSoul("thingAllComments")),
  and(keyIs("votesup"), isSoul("thingVotes")),
  and(keyIs("votesdown"), isSoul("thingVotes")),
  and(keyIs("op"), isSoul("thing")),
  and(keyIs("replyTo"), isSoul("thing")),
  keyIs("timestamp"),
);

export const thingVotes = (key, val, parent, pKey, msg, peer) => {
  const complexity = DEFAULT_POW_COMPLEXITY;
  const match = peer.souls.thingVotes.isMatch(val["#"] || key);
  Object.keys(val).map(voteKey => {
    if (voteKey === "#" || voteKey === "_") return;
    const vote = val[voteKey];
    const verifier = new pow.Verifier({
      size: 1024,
      n: 16,
      complexity,
      prefix: key,
      validity: Infinity,
    });

    const nonce = Buffer.hasOwnProperty("from") ?
      Buffer.from(vote, "hex") : new Buffer(vote, "hex");

    if (!verifier.check(nonce, complexity)) {
      console.warn("invalid vote", key, vote); // eslint-disable-line
      delete val[voteKey]; // eslint-disable-line
    }
  });
  return !!match;
};

export const things = allowFields(
  and(isSoul("thing"), soulMatchesKey)
);

const sanitizeThingData = allowFields(
  keyIs("kind"),
  keyIs("title"),
  keyIs("topic"),
  keyIs("body"),
  keyIs("author"),
  keyIs("authorId"),
  keyIs("opId"),
  keyIs("replyToId"),
  keyIs("domain"),
  keyIs("url"),
  keyIs("timestamp"),
);

export const thingData = (key, val, parent, pKey, msg, peer) =>
  sanitizeThingData(key, val, parent, pKey, msg, peer)
    .then(() => {
      const { _, ...record } = val;
      delete record["#"];

      if (peer.isBlocked(key)) {
        val["url"] = null; // eslint-disable-line
        val["body"] = "[removed]"; // eslint-disable-line
        Object.keys(val).forEach(vk => {
          if (vk !== "url" && vk !== "body" && vk !== "_" && vk !== "#") {
            delete val[vk]; // eslint-disable-line
          }
        });
      } else if (Object.keys(record).length) {
        const id = objHash(record, { unorderedSets: true });
        const match = peer.souls.thingData.isMatch(prop("#", val) || key);

        if (id !== match.thingid) {
          console.warn("thing data mismatch", id, match.thingid, msg, record); // eslint-disable-line
          Object.keys(val).forEach(vk => {
            if (vk !== "_" && vk !== "#") {
              delete val[vk]; // eslint-disable-line
            }
          });
        }
      }

      return val;
    });
