import { ZalgoPromise } from "zalgo-promise";
import { isNil, prop, identity, compose, union, reduce, filter, intersection, keysIn } from "ramda";

const { resolve } = ZalgoPromise;

export const PREFIX = "nab";
export const SOUL_DELIMETER = "|~~|";
export const COMMENT_BODY_MAX = 10000;
export const SUBMISSION_TITLE_MAX = 300;
export const SUBMISSION_BODY_MAX = 40000;
export const TOPIC_NAME_MAX = 42;

export const getDayStr = timestamp => {
  const d = new Date(timestamp || (new Date()).getTime());
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const dayNum = d.getUTCDate();
  return `${year}/${month}/${dayNum}`;
};

export const keyIs = val => key => key === val;
export const valIs = checkVal => (_k, val) => checkVal === val;
export const isSoul = soul => (key, val, parent, parentKey, msg, peer) => {
  const isMatch =  peer.souls[soul].isMatch(prop("#", val) || key);
  if (isMatch) {
    const schemaCheck = peer.schema[soul](key, val, parent, parentKey, msg, peer);
    return isMatch && schemaCheck;
  }
};
export const soulMatchesKey = (key, val) => (prop("#", val) === key);
export const valFromSoul= (soul, routeKey) => (key, val, parent, pKey, _msg, peer) =>
  val === peer.souls[soul].isMatch(prop("#", parent) || pKey)[routeKey];

export const allowFields = (...validators) => (pKey, val, _parent, _pKey, msg, peer) =>
  ZalgoPromise.all(
    Object.keys(val || {}).map(key => ZalgoPromise.all(
      [keyIs("_"), keyIs("#"), ...validators]
        .map(fn => ZalgoPromise.resolve(fn(key, val[key], val, pKey, msg, peer)))
    )
      .then(results => {
        if (!results.find(identity)) {
          if (key.indexOf("~") === -1) {
            // console.warn("sanitizing message", pKey, key); // eslint-disable-line
            delete val[key]; // eslint-disable-line
          } else {
            // console.warn("sea", pKey, key, msg); // eslint-disable-line
          }
        }
      })))
    .then(() => val);

export const and = (...fns) => (...args) => {
  let result;
  return !fns.find((fn, idx) => idx === 0 // eslint-disable-line
    ? !(result = fn(...args))
    : !fn(...args))
    ? result
    : false;
};

const count = x => (x && x.length || 0);

export const getRecord = (peer, soul) => (peer.gun.redis ? peer.gun.redis.get : peer.get)(soul);

export const emptyPromise = resolve(null);
export const getKeys = node => keysIn(node || {})
  .filter(x => (x && x !== "#" && x !== "_" && x !== "undefined"));
export const countKeys = compose(count, getKeys);
export const getSouls = compose(filter(x => !!x), getKeys); // TODO: better implementation
export const hasItems = node => (getSouls(node).length > 0);

// eslint-disable-next-line
const intersectSetsReducer = (souls, items) => (items === null) ? souls : (souls === null)
  ? getSouls(items) : intersection(souls, getSouls(items));
export const intersectSets = compose(souls => souls || [], reduce(intersectSetsReducer, null));

const unionSetsReducer = (souls, items) => (items === null) ? souls : (souls === null)
  ? getSouls(items) : union(souls, getSouls(items));
export const unionSets = compose(souls => souls || [], reduce(unionSetsReducer, null));
export const unionArrays = reduce(union, []);
export const intersectArrays = reduce(
  (res, ary) => (isNil(ary)) ? res : isNil(res) ? ary : intersection(res, ary),
  null
);

export const mergeObjects = (objList) => {
  const res = {};
  objList.forEach(obj => keysIn(obj || {}).forEach(key => res[key] = obj[key]));
  return res;
};
