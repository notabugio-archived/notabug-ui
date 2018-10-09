import "better-queue-memory";
import { path, prop } from "ramda";
import isNode from "detect-node";
import { ZalgoPromise as Promise } from "zalgo-promise";

let Queue;

if (isNode) {
  Queue = require("better-queue");
} else {
  class QueueClass {
    constructor(fn) {
      this.fn = fn;
    }

    push = (action) => setTimeout(() => this.fn(action, () => null), 50);
  }

  Queue = QueueClass;
}

export const compute = peer => (soul, updatedAt) => {
  peer.watched = peer.watched || {}; // eslint-disable-line no-param-reassign
  const route = peer.getComputeRoute(soul);
  if (!route) return console.warn("Invalid compute path", soul) || Promise.resolve(null); // eslint-disable-line
  const scope = peer.newScope({ noGun: true });
  return scope.get(soul).then(existing => {
    const latest = Math.max(
      peer.computed[soul],
      ...Object.values(path(["_", ">"], existing) || {})
    );
    if (parseInt(prop("locked", existing), 10)) {
      console.log("Locked listing", soul, existing);
      return Promise.resolve(existing);
    }
    if ((updatedAt && updatedAt <= latest)) {
      return Promise.resolve(existing);
    }

    if (!updatedAt && !peer.computed[soul]) {
      const now = (new Date()).getTime();
      const interval = now - latest;
      if (interval < (1000 * 60 * 5)) return console.log("fresh", soul) || Promise.resolve(existing);
    }

    peer.computed[soul] = peer.computed[soul] || 1; // eslint-disable-line
    // console.log("query", soul);
    return route.query(scope).then(r => {
      // this is a workaround for a lame SEA bug
      Object.keys(r).forEach(key => {
        if (r[key] !== null) r[key] = `${r[key]}`; // eslint-disable-line no-param-reassign
      });
      if (
        !existing ||
        Object.keys(r || {}).find(key => {
          if (key !== "_" && r[key] !== existing[key]) {
            return true;
          }
        })
      ) {
        console.log("updating", soul);
        peer.gun.get(soul).put(r);
        peer.computed[soul] = (new Date()).getTime(); // eslint-disable-line no-param-reassign
      } else {
        peer.computed[soul] = latest; // eslint-disable-line no-param-reassign
      }
      if (route.observeAccessed) {
        for (const key in scope.getAccesses()) { // eslint-disable-line
          const recomputes = peer.watched[key] = peer.watched[key] || {}; // eslint-disable-line
          recomputes[soul] = true;
        }
      }
      return r;
    });
  }).catch(error => console.error(error.stack || error));
};

export const worker = peer => (new Queue((action, done) => {
  const { id: soul, latest } = action || {};
  if (!soul) return console.warn("Invalid worker action", action) || done(); // eslint-disable-line
  peer.compute(soul, latest).then(done).catch(error => console.error(error) || done()); // eslint-disable-line
}, { concurrent: 1000 }));

export const lookForWork = peer => msg => {
  try {
    peer.watched = peer.watched || {}; // eslint-disable-line no-param-reassign
    peer.computed = peer.computed || {}; // eslint-disable-line no-param-reassign
    if (!peer.computedPub) {
      const me = peer.isLoggedIn();
      if (!me || !me.pub) return;
      peer.computedPub = `${me.pub}.`; // eslint-disable-line
    }
    if (!peer.computedPub) return;

    for (const propName in (msg.get || {})) { // eslint-disable-line guard-for-in
      const rawSoul = msg.get[propName];
      if (/*peer.computed[rawSoul] || */rawSoul.indexOf(peer.computedPub) === -1) return;
      peer.worker.push({ id: rawSoul });
    }

    if (msg.get && msg.get["#"]) {
      const rawSoul = msg.get["#"];
      if (/*peer.computed[rawSoul] || */rawSoul.indexOf(peer.computedPub) === -1) return;
      peer.worker.push({ id: rawSoul });
    }

    for (const propName in msg.put || {}) { // eslint-disable-line guard-for-in
      if (propName in peer.watched) {
        let latest = 0;
        for (const ts in Object.values(path(["_", ">"], msg.put[propName] || {}))) {
          if (ts > latest) latest = ts;
        }
        for (const soul in peer.watched[propName]) {
          peer.worker.push({ id: soul, latest }); // eslint-disable-line
        }
      }
    }
  } catch(e) {
    console.error("look for work error", e.stack || e);
  }
};
