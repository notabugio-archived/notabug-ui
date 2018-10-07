import "better-queue-memory";
import { path, prop } from "ramda";
import Queue from "better-queue";
import { ZalgoPromise as Promise } from "zalgo-promise";

export const compute = peer => (soul, updatedAt) => {
  peer.watched = peer.watched || {}; // eslint-disable-line no-param-reassign
  const route = peer.getComputeRoute(soul);
  if (!route) return console.warn("Invalid compute path", soul) || Promise.resolve(null); // eslint-disable-line
  const scope = peer.newScope();
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

    console.log("query", soul);
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
}, { concurrent: 500 }));

export const lookForWork = peer => msg => {
  peer.watched = peer.watched || {}; // eslint-disable-line no-param-reassign
  peer.computed = peer.computed || {}; // eslint-disable-line no-param-reassign
  if (!peer.computedPub) {
    const me = peer.isLoggedIn();
    if (!me || !me.pub) return;
    peer.computedPub = `${me.pub}.`; // eslint-disable-line
  }
  if (!peer.computedPub) return;

  for (const propName in msg.get || {}) { // eslint-disable-line guard-for-in
    const rawSoul = msg.get[propName];
    if (/*peer.computed[rawSoul] || */rawSoul.indexOf(peer.computedPub) === -1) return;
    peer.computed[rawSoul] = 1; // eslint-disable-line
    peer.worker.push({ id: rawSoul });
  }

  for (const propName in msg.put || {}) { // eslint-disable-line guard-for-in
    if (propName in peer.watched) {
      const latest = Math.max(...Object.values(path(["_", ">"], msg.put[propName]) || {}));
      for (const soul in peer.watched[propName]) {
        if (latest > peer.computed[soul]) peer.worker.push({ id: soul, latest }); // eslint-disable-line
      }
    }
  }
};
