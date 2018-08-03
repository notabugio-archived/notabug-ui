/* globals Promise */
import { path, prop, compose, always, identity, assocPath, uniq } from "ramda";
import { provideState, update } from "freactal";
import { withRouter } from "react-router-dom";
import "gun";
import notabugPeer, { PREFIX } from "notabug-peer";
import isNode from "detect-node";

let COUNT_VOTES = false;
let LOCAL_STORAGE = false;

const preloadTimes = {};
const preloadPromises = {};

if (!isNode) {
  COUNT_VOTES = !!(/countVotes/.test(window.location.search));
  LOCAL_STORAGE = !!(/localStorage/.test(window.location.search));

  if (!(/nosea/.test(window.location.search))) {
    require("sea");
  }
}

const markPreloaded = url => Promise.resolve(preloadTimes[url] = Date.now());

const initialState = ({ history, notabugApi }) => {
  notabugApi = notabugApi || notabugPeer({
    noGun: isNode ? true : false,
    localStorage: LOCAL_STORAGE,
    countVotes: COUNT_VOTES,
    disableValidation: true,
    peers: isNode ? [] : [
      window.location.origin + "/gun",
      //"https://notabug.io/gun",
    ]
  }, isNode ? null : window.initNabState);

  if (!isNode && notabugApi.gun) {
    window.notabug = notabugApi;
  }

  return {
    history,
    notabugApi,
    notabugState: notabugApi.getState(),
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

const onNotabugReceiveIdsData = (effects, data) => effects.getState()
  .then(({ notabugApi }) => {
    notabugApi.mergeState({ data });
    return state => ({ ...state, notabugState: notabugApi.getState() });
  });

const onUpdateNotabugState = update(({ notabugApi }) => ({ notabugState: notabugApi.getState() }));

const onNotabugPreloadFromUrl = (effects, url, preState={}) =>
  effects.getState().then(({ notabugApi }) =>
    prop(url, preloadTimes) && (Date.now() - prop(url, preloadTimes)) < 1000*60
      ? (preloadPromises[url] || Promise.resolve().then(always(identity)))
      : preloadPromises[url] = markPreloaded(url) && fetch(url)
        .then(response => {
          if (response.status !== 200) throw new Error("Bad response from server");
          return response.json();
        })
        .then(state => ({ ...state, ...preState }))
        .then(notabugApi.loadState)
        .then(() => effects.onUpdateNotabugState())
        .then(always(identity)));

const onNotabugPreloadListing = (effects, listingProps) => effects.getState()
  .then(({ notabugApi }) => {
    const reducer = always(identity);
    if (listingProps.topics && listingProps.topics.length) {
      return Promise.all(listingProps.topics
        .map(topicName => effects
          .onNotabugPreloadFromUrl(`/api/topics/${topicName}.json`, { topic: topicName }))
      ).then(reducer);
    } else if (listingProps.replyToId) {
      const opId = notabugApi.getOpId(listingProps.replyToId);
      return effects.onNotabugPreloadFromUrl(
        `/api/submissions/${opId}.json`,
        { collectionSoul: notabugApi.souls.thingAllComments.soul({ thingid: opId }) }
      ).then(reducer);
    }
    return Promise.resolve().then(reducer);
  });

const onNotabugPreloadIds = (effects, ids) => effects.getState()
  .then(({ notabugApi }) => {
    const nabState = notabugApi.getState();
    const opIds = ids.map(notabugApi.getOpId).filter(x => !!x);
    const fetchIds = uniq(ids.concat(opIds)).filter(id => !path(["data", id], nabState)).sort();
    if (!fetchIds.length) return {};

    return fetch(`/api/things/${uniq(ids.concat(opIds)).sort().join(",")}.json`)
      .then(response => {
        if (response.status !== 200) throw new Error("Bad response from server");
        return response.json();
      });
  })
  .then(effects.onNotabugReceiveIdsData)
  .then(always(identity));

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

const onNotabugToggleInfiniteScroll = update(({ notabugInfiniteScroll }) =>
  ({ notabugInfiniteScroll: !notabugInfiniteScroll }));

const initialize = effects => effects.getState()
  .then(({ notabugApi }) => {
    notabugApi.onLogin(effects.onLogin);
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
  })
  .then(always(identity));

export const notabug = compose(
  withRouter, provideState({
    initialState,
    effects: {
      initialize,
      getState,
      onNotabugMarkMine,
      onNotabugPreloadFromUrl,
      onNotabugPreloadListing,
      onNotabugPreloadIds,
      onNotabugReceiveIdsData,
      onNotabugToggleInfiniteScroll,
      onUpdateNotabugState,
      onListenForReplies,
      onLogin,
      onLogout
    }
  })
);
