/* globals Gun */
import Promise from "promise";
import Route from "route-parser";
import { keysIn, prop, identity } from "ramda";
import * as consts from "./constants";

export const nodeType = (path, checkSoulMatch, sanitizeNode) => {
  const routeMatcher = new Route(path);
  const methods = {
    checkSoulMatch,
    sanitizeNode,
    isMatch(pathToCheck) {
      const didMatch = routeMatcher.match(pathToCheck);
      return didMatch && checkSoulMatch(didMatch) ? didMatch : null;
    },
    soul: params => routeMatcher.reverse(params || {})
  };
  const init = peer => ({
    ...methods,
    get: params => peer.gun.get(routeMatcher.reverse(params || {}))
  });
  keysIn(methods).forEach(key => (init[key] = methods[key]));
  return init;
};

export const maxSize = maxBytes => (_k, val) =>
  (typeof val === "object" ? sizeOfObject(val) : (val || "").length || 0) <=
  maxBytes;
export const keyIs = val => key => key === val;
export const valIs = checkVal => (_k, val) => checkVal === val;
export const isNumeric = (k, v) => maxSize(128)(k, v) && !isNaN(parseFloat(v));
export const isTimestamp = isNumeric;
export const isUrl = (_k, v) => (v || "").length <= consts.MAX_URL_SIZE;
export const isAuthorId = maxSize(consts.MAX_AUTHOR_ID_SIZE);
export const isBoolean = maxSize(8);
export const isBlank = (_k, val) => !val;
export const soulMatchesKey = (key, val) => prop("#", val) === key;
export const valFromSoul = (soul, routeKey) => (
  key,
  val,
  parent,
  pKey,
  _msg,
  peer
) => val === peer.souls[soul].isMatch(prop("#", parent) || pKey)[routeKey];

export const isSoul = soul => (key, val, parent, parentKey, msg, peer) =>
  peer.souls[soul].isMatch(prop("#", val) || key);

export const isNodeType = soul => (key, val, parent, parentKey, msg, peer) => {
  const isMatch = isSoul(soul)(key, val, parent, parentKey, msg, peer);
  if (isMatch) {
    const schemaCheck = peer.souls[soul].sanitizeNode(
      key,
      val,
      parent,
      parentKey,
      msg,
      peer
    );
    return isMatch && schemaCheck;
  }
};

export const allowFields = (...validators) => (
  pKey,
  val,
  _parent,
  _pKey,
  msg,
  peer
) =>
  Promise.all(
    keysIn(val || {}).map(key =>
      Promise.all(
        [keyIs("_"), keyIs("#"), ...validators].map(fn =>
          Promise.resolve(fn(key, val[key], val, pKey, msg, peer))
        )
      ).then(results => {
        if (!results.find(identity)) {
          val[key] && console.warn("sanitizing", pKey, key, val[key]); // eslint-disable-line
          delete val[key]; // eslint-disable-line
        }
      })
    )
  ).then(() => val);

export const allowSoulFields = (...validators) => match =>
  !keysIn(match).find(key => !validators.find(fn => fn(key, match[key])));

export const allowFieldsSEA = (...validators) => (
  pKey,
  val,
  _parent,
  _pKey,
  msg,
  peer
) =>
  Promise.all(
    keysIn(val || {}).map(key => {
      let decoded = null;
      Gun.SEA.verify(val[key], false, (res) => (decoded = Gun.SEA.opt.unpack(res, key, val)));
      return Promise.all(
        [keyIs("_"), keyIs("#"), ...validators].map(fn =>
          Promise.resolve(fn(key, decoded, val, pKey, msg, peer))
        )
      ).then(results => {
        if (results.find(identity)) return;
        decoded && key !== "authorClass" && console.warn("sea sanitizing", pKey, key, decoded); // eslint-disable-line
        delete val[key]; // eslint-disable-line
      });
    })
  ).then(() => val);

export const and = (...fns) => (...args) => {
  let result;
  return !fns.find((fn, idx) =>
    idx === 0 // eslint-disable-line
      ? !(result = fn(...args))
      : !fn(...args)
  )
    ? result
    : false;
};

export const or = (...fns) => (...args) => {
  let result;
  return fns.find(fn => (result = fn(...args))) ? result : false;
};

const allowNodeTypes = schema => (cmd, puts, _parent, _pKey, msg, peer) => {
  const soulTypes = keysIn(schema);
  return Promise.all(
    keysIn(puts).map(soul => {
      const typeName = soulTypes.find(type => schema[type].isMatch(soul));
      if (!typeName) {
        delete puts[soul];
        console.error("unknown type", typeName, soul);
        return Promise.resolve();
      }
      // console.log("validating", typeName, soul);
      return schema[typeName].sanitizeNode(
        soul,
        puts[soul],
        puts,
        cmd,
        msg,
        peer
      );
    })
  );
};

export function validateWireInput(peer, context) {
  const allowTypes = allowNodeTypes(peer.schema);

  context.on("in", function wireInput(msg) {
    if (msg && msg.err && msg.err === "Error: Invalid graph!") return;
    if (!msg || !(msg.put || msg.get)) return;

    Promise.all(
      keysIn(msg || {}).map(key => {
        if (key === "put" && msg.mesh) {
          const validated = msg;
          keysIn(validated.put || {}).forEach(putKey => {
            validated.put[putKey] = peer.config.putMutate
              ? peer.config.putMutate(msg.put[putKey], putKey)
              : validated.put[putKey];
          });
          if (!peer.config.disableValidation) {
            return Promise.resolve(
              allowTypes(key, validated[key], validated, null, validated, peer)
            );
          }
        }
        return Promise.resolve(msg);
      })
    )
      .then(() => {
        if (msg && msg.put && !keysIn(msg.put).length) return; // Rejected all writes
        try {
          if (peer.config.oracle && msg.get)
            peer.config.oracle.onGet(peer, msg);
        } catch (e) {
          console.error("oracle error", e);
        }
        if (peer.config.leech && msg.mesh && msg.get) return; // ignore gets
        this.to.next(msg);
      })
      .catch(e => console.error("Message rejected", e.stack || e, msg)); // eslint-disable-line
  });
}

// Based on https://stackoverflow.com/a/11900218
export function sizeOfObject(object) {
  const objectList = [];
  const stack = [object];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (typeof value === "boolean") {
      bytes += 4;
    } else if (typeof value === "string") {
      bytes += value.length * 2;
    } else if (typeof value === "number") {
      bytes += 8;
    } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
      objectList.push(value);

      for (const i in value) {
        stack.push(i);
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}
