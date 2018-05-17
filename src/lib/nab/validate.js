import { path, propOr, always } from "ramda";
import objHash from "object-hash";
import Route from "route-parser";
import { PREFIX } from "./etc";
import { verifyWork } from "pow";
import urllite from "urllite";
import { blockedMap } from "./blocked";

export const COMMENT_BODY_MAX = 10000;
export const SUBMISSION_TITLE_MAX = 300;
export const SUBMISSION_BODY_MAX = 40000;
export const TOPIC_NAME_MAX = 42;

const COMMENT_FIELDS = ["body", "timestamp", "kind", "replyToId", "opId"];
const SUBMISSION_FIELDS = ["body", "timestamp", "kind", "title", "topic", "url"];

const recordOnly = record => Object.keys(record).reduce(
  (rec, key) => {
    if (key === "_" || path([key, "#"], record)) return rec;
    return { ...rec, [key]: record[key] };
  },
  {}
);

const checkFields = (fields, record) => {
  const keys = Object.keys(record);
  const byKey = keys.reduce((r, k) => ({ ...r, [k]: true }), {});
  return (keys.length === fields.length) && !fields.find(f => !byKey[f]);
};

const validateComment = (id, comment) => {
  const record = recordOnly(comment);
  delete record.id;
  if (!checkFields(COMMENT_FIELDS, record)) return false;
  return true;
};

const validateSubmission = (id, submission) => {
  const record = recordOnly(submission);
  delete record.id;
  if (!checkFields(SUBMISSION_FIELDS, record)) return false;
  return true;
};

const validators = { comment: validateComment, submission: validateSubmission };

export const validate = (id, thing) => {
  if (!thing) return false;
  const kind = thing.kind;
  const validator = validators[kind] || always(false);
  return validator(id, thing);
};

const route = (path, checkMatch, validateData) => {
  const routeMatcher = new Route("/" + path);

  return {
    checkMatch,

    isMatch(pathToCheck) {
      const didMatch = routeMatcher.match("/" + pathToCheck);
      return (didMatch && checkMatch(didMatch)) ? didMatch : null;
    },

    validate(data, params) {
      return data && validateData(data, params);
    }
  };
};

const checkTopicMatch = ({ topicname }) => {
  if (!topicname || typeof topicname !== "string") return false;
  if (topicname !== topicname.toLowerCase()) return false;
  return true;
};

const checkTopicData = (data, { topicname }) => !Object.keys(data).find(key => {
  if (key === "_") return false;
  if (key === "name" && data[key] === topicname) return false;
  if (!soulRoutes.thing.isMatch(key)) return true;
  if (path([key, "#"], data) !== key) return true;
  return false;
});

const checkThingMatch = ({ thingid }) => {
  if (!thingid || typeof thingid !== "string") return false;
  // TODO: check length?
  return true;
};

const checkVote = kind => (votes, { thingid }) => !Object.keys(votes).find(key => {
  if (key === "_") return false;
  if (typeof votes[key] !== "string") return false;
  return !verifyWork(`${PREFIX}/things/${thingid}/${kind}`, votes[key]);
});

const soulRoutes = {
  topicDay: route(
    `${PREFIX}/topics/:topicname/days/:year/:month/:day`,
    ({ topicname, year, month, day }) => {
      year = parseInt(year, 10);
      month = parseInt(month, 10);
      day = parseInt(day, 10);
      if (!year || !month || !day || !topicname) return false;
      const d = new Date(year, month - 1, day);
      if (!(
        d.getFullYear() === year,
        d.getMonth() + 1 === month,
        d.getDate() === day
      )) return false;
      return checkTopicMatch({ topicname });
    },
    checkTopicData
  ),

  topicDays: route(
    `${PREFIX}/topics/:topicname/days`,
    checkTopicMatch,
    (data) => !Object.keys(data).find(key => {
      if (key === "_") return false;
      if (!soulRoutes.topicDay.isMatch(key)) return true;
      if (path([key, "#"], data) !== key) return true;
      return false;
    })
  ),

  topic: route(
    `${PREFIX}/topics/:topicname`,
    checkTopicMatch,
    checkTopicData
  ),

  domain: route(
    `${PREFIX}/domains/:domain`,
    always(true), // TODO: verify domain structure
    (data) => !Object.keys(data).find(key => {
      if (key === "_") return false;
      if (!soulRoutes.thing.isMatch(key)) return true;
      if (path([key, "#"], data) !== key) return true;
      return false;
    })
  ),

  topics: route(
    `${PREFIX}/topics`,
    always(true),
    (data) => !Object.keys(data).find(key => {
      if (key === "_") return false;
      if (!soulRoutes.topic.isMatch(key)) return true;
      if (path([key, "#"], data) !== key) return true;
      return false;
    })
  ),

  url: route(
    [`${PREFIX}/urls/`, "*url"].join(""),
    ({ url }) => {
      const urlinfo = urllite(url);
      if (urlinfo.host && urlinfo.protocol) return true;
      return false;
    },
    (data) => !Object.keys(data).find(key => {
      if (key === "_") return false;
      if (!soulRoutes.thing.isMatch(key)) return true;
      if (path([key, "#"], data) !== key) return true;
      return false;
    })
  ),

  thingData: route(
    `${PREFIX}/things/:thingid/data`,
    checkThingMatch,
    (data, { thingid }) => {
      const { _, ...record } = data; // eslint-disable-line
      const id = objHash(record, { unorderedSets: true });
      if (blockedMap[thingid]) {
        data["url"] = null;
        data["body"] = "[removed]";
        return true;
      }
      if (thingid !== id) return false;
      // TODO: kind based validation
      return true;
    }
  ),

  thingVotesUp: route(
    `${PREFIX}/things/:thingid/votesup`,
    checkThingMatch,
    checkVote("votesup")
  ),

  thingVotesDown: route(
    `${PREFIX}/things/:thingid/votesdown`,
    checkThingMatch,
    checkVote("votesdown")
  ),

  thingAllComments: route(
    `${PREFIX}/things/:thingid/allcomments`,
    checkThingMatch,
    checkTopicData
  ),

  thingComments: route(
    `${PREFIX}/things/:thingid/comments`,
    checkThingMatch,
    checkTopicData
  ),

  thing: route(
    `${PREFIX}/things/:thingid`,
    checkThingMatch,
    (data, { thingid }) => !Object.keys(data).find(key => {
      if (key === "_") return false;
      if (key === "id" && thingid === data[key]) return false;
      if (key === "timestamp") return false; // TODO: timestamp validation
      if (key === "topic") return !soulRoutes.topic.isMatch(path([key, "#"], data));
      if (key === "domain") return !soulRoutes.domain.isMatch(path([key, "#"], data));
      if (key === "url") return !soulRoutes.url.isMatch(path([key, "#"], data));
      if (path([key, "#"], data) === `${PREFIX}/things/${thingid}/${key}`) return false;
      if (soulRoutes.thing.isMatch(path([key, "#"], data))) return false;
      return true;
    })
  ),

  things: route(
    `${PREFIX}/things`,
    always(true),
    checkTopicData
  ),
};

const routes = Object.values(soulRoutes);

export const checkMessage = (msg) => {
  const put = propOr({}, "put", msg) || {};
  return !Object.keys(put).find(soul => {
    let match;
    const route = routes.find(x => match = x.isMatch(soul));
    return route ? !route.validate(put[soul], match) : true;
  });
};
