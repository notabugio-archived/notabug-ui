/* globals Gun */
import { curry } from "ramda";
import { ZalgoPromise as Promise } from "zalgo-promise";

export const signup = curry((peer, username, password, opts) => new Promise((ok, fail) => {
  if (peer && peer.gun && peer.gun.user) {
    const user = peer.user();
    user.create(username, password,
      (ack) => {
        if (ack.err) {
          fail(ack.err)
          user.leave();
          peer.gun.user().leave();
        } else {
          peer.login(username, password).then(ok);
        }
      },
      opts
    );
  } else {
    fail("SEA is not loaded");
  }
}));

export const login = curry((peer, username, password) => (new Promise((ok, fail) => {
  if (peer && peer.gun && peer.gun.user) {
    const user = peer.user();
    user.auth(username, password, (ack) => ack.err ? fail(ack.err) : ok(peer.user().is));
  } else {
    fail("SEA is not loaded");
  }
})).then(result => {
  peer._onLogin && peer._onLogin(result); // eslint-disable-line
  return result;
}));

export const user = peer => () => peer.gun.user();

export const isLoggedIn = peer => () =>
  peer.gun && peer.gun.user && peer.user().is;

export const onLogin = peer => fn => peer._onLogin = fn; // eslint-disable-line
