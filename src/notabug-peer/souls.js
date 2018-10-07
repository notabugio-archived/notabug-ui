import { always, keysIn } from "ramda";
import Route from "route-parser";
import urllite from "urllite";
import { PREFIX, getDayStr } from "./util";

const objectType = (path, checkMatch, options) => {
  const routeMatcher = new Route(path);
  const methods = {
    checkMatch,
    isMatch(pathToCheck) {
      const didMatch = routeMatcher.match(pathToCheck);
      return (didMatch && checkMatch(didMatch)) ? didMatch : null;
    },
    soul: params => routeMatcher.reverse(params || {}),
  };
  const init = peer => ({
    ...methods, get: params => peer.gun.get(routeMatcher.reverse(params || {})),
  });
  keysIn(methods).forEach(key => init[key] = methods[key]);
  return init;
};

const checkTopicMatch = ({ topicname }) => {
  if (!topicname || typeof topicname !== "string") return false;
  if (topicname !== topicname.toLowerCase()) return false;
  return true;
};

const checkThingMatch = ({ thingid }) => {
  if (!thingid || typeof thingid !== "string") return false;
  // TODO: check length?
  return true;
};

export const topicDay = objectType(
  `${PREFIX}/topics/:topicname/days/:year/:month/:day`,
  ({ topicname, year, month, day }) =>  {
    const iyear = parseInt(year, 10);
    const imonth = parseInt(month, 10);
    const iday = parseInt(day, 10);
    if (!iyear || !imonth || !iday || !topicname) return false;
    const d = new Date(year, month - 1, day);
    if (getDayStr(d) !== `${year}/${month}/${day}`) return false;
    return checkTopicMatch({ topicname });
  }
);

export const topicDays = objectType(
  `${PREFIX}/topics/:topicname/days`,
  checkTopicMatch,
);

export const topic = objectType(
  `${PREFIX}/topics/:topicname`,
  checkTopicMatch,
);

export const topics = objectType(
  `${PREFIX}/topics`,
  always(true),
);

export const domain = objectType(
  `${PREFIX}/domains/:domain`,
  always(true), // TODO: verify domain structure
);

export const url = objectType(
  [`${PREFIX}/urls/`, "*url"].join(""),
  (match) => {
    const urlinfo = urllite(match.url);
    if (urlinfo.host && urlinfo.protocol) return true;
    return false;
  },
);

export const thingData = objectType(
  `${PREFIX}/things/:thingid/data`,
  checkThingMatch,
);

export const thingVotes = objectType(
  `${PREFIX}/things/:thingid/votes:votekind`,
  checkThingMatch,
);

export const thingVoteCounts = objectType(
  `${PREFIX}/things/:thingid/votecounts`,
  checkThingMatch,
);

export const thingAllComments = objectType(
  `${PREFIX}/things/:thingid/allcomments`,
  checkThingMatch,
);

export const thingComments = objectType(
  `${PREFIX}/things/:thingid/comments`,
  checkThingMatch,
);

export const thing = objectType(
  `${PREFIX}/things/:thingid`,
  checkThingMatch,
);

export const things = objectType(
  `${PREFIX}/things`,
  always(true),
);

// User data

export const lenses = objectType(
  `${PREFIX}/lenses`,
  always(true)
);

export const lens = objectType(
  `${PREFIX}/lenses/:lensname`,
  ({ lensname }) => !!lensname
);

export const lensThings = objectType(
  `${PREFIX}/lenses/:lensname/things`,
  ({ lensname }) => !!lensname
);
