import { compose, always, identity, assocPath } from "ramda";
import { provideState, update } from "freactal";
import { withRouter } from "react-router-dom";
import "gun/gun";
import notabugPeer, { PREFIX } from "notabug-peer";
import isNode from "detect-node";

let COUNT_VOTES = false;
let LOCAL_STORAGE = false;

if (!isNode) {
  COUNT_VOTES = !!(/countVotes/.test(window.location.search));
  LOCAL_STORAGE = !!(/localStorage/.test(window.location.search));

  if (!(/nosea/.test(window.location.search))) {
    require("sea");
  }
}

const initialState = ({ history, notabugApi }) => {
  notabugApi = notabugApi || notabugPeer({
    noGun: isNode ? true : false,
    localStorage: LOCAL_STORAGE,
    countVotes: COUNT_VOTES,
    disableValidation: true,
    leech: true,
    peers: isNode ? [] : [
      window.location.origin + "/gun",
      // "https://notabug.io/gun",
    ]
  });

  if (!isNode && !notabugApi.scope) {
    notabugApi.scope = notabugApi.newScope({
      cache: window.initNabState,
      onlyCache: true,
      isCached: true,
      isCacheing: true
    });
    // window.initNabState = null;
  }

  if (!isNode && notabugApi.gun) {
    window.notabug = notabugApi;
  }

  return {
    history,
    notabugApi,
    notabugUser: null,
    notabugUserId: null,
    notabugInfiniteScroll: false,
    thingData: {},
    preloaded: {},
    myContent: {}
  };
};

const getState = always(identity);

const onNotabugMarkMine = (effects, id) => {
  //effects.onListenForReplies(id); // TODO: this is currently broken
  return effects.getState()
    .then(() => assocPath(["myContent", id], true));
};

const onUpdateNotabugState = update(({ notabugApi }) => ({ notabugState: notabugApi.getState() }));

const onListenForReplies = (effects, id) => effects.getState()
  .then(({ notabugApi }) => {
    notabugApi.gun.get(`${PREFIX}/things/${id}`).get("comments").map().once(({ id }) => {
      let hasNotified = false;
      const onChange = () => {
        if (hasNotified) return;
        if (notabugApi.getScore(id) > 0) {
          hasNotified = true;
          notabugApi.onChangeThingOff(id, onChange);
          notabugApi.gun.get(`${PREFIX}/things/${id}/data`).once(({ opId }) => {
            notabugApi.gun.get(`${PREFIX}/things/${opId}/data`).once(({ title, topic }) =>
              effects.onNotifyUser({
                title: "Comment reply in " + topic,
                body: "on: " + title,
                onOpen: () => effects.pushRouterState(`/t/${topic}/comments/${opId}/`)
              })
            );
          });
        }
      };
      notabugApi.onChangeThing(id, onChange);
    });
    return state => state;
  });

const onLogin = update((state, { alias, pub }) => ({ notabugUser: alias, notabugUserId: pub }));

const onLogout = update((state) => {
  state.notabugApi.gun.user().leave();
  sessionStorage && sessionStorage.clear();
  //window.location.reload();
  return { notabugUser: null, notabugUserId: null };
});

const onFetchCache = (effects, pathname, search) => effects.getState()
  .then(({ notabugApi }) => fetch(`/api${pathname}.json${search}`)
    .then(response => {
      if (response.status !== 200) throw new Error("Bad response from server");
      return response.json();
    })
    .then(notabugApi.scope.loadCachedResults))
  .then(always(identity));

const onNotabugToggleInfiniteScroll = update(({ notabugInfiniteScroll }) =>
  ({ notabugInfiniteScroll: !notabugInfiniteScroll }));

const initialize = effects => effects.getState()
  .then(({ notabugApi }) => {
    notabugApi.onLogin(effects.onLogin);
    /*
    if (!isNode && notabugApi.gun.user) {
      console.log("attempting auto-login");
      notabugApi.gun.user().recall({ sessionStorage: true });
      const check = () => {
        const auth = notabugApi.isLoggedIn();
        if (notabugApi.isLoggedIn()) {
          effects.onLogin(auth);
        }
        clearInterval(check);
      };
      setInterval(check, 100);
    }
    */
  })
  .then(always(identity));

export const notabug = compose(
  withRouter, provideState({
    initialState,
    effects: {
      initialize,
      getState,
      onFetchCache,
      onNotabugMarkMine,
      onNotabugToggleInfiniteScroll,
      onUpdateNotabugState,
      onListenForReplies,
      onLogin,
      onLogout
    }
  })
);
