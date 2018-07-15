/* globals Promise */
import { prop, compose, always, identity, assocPath, uniq } from "ramda";
import { provideState, update } from "freactal";
import { withRouter } from "react-router-dom";
import "gun";
import notabugPeer, { PREFIX } from "notabug-peer";

const COUNT_VOTES = !!(/countVotes/.test(window.location.search));
const LOCAL_STORAGE = !!(/localStorage/.test(window.location.search));

if ((/sea/.test(window.location.search))) {
  require("sea");
}

const initialState = ({ history }) => {
  const notabugApi = notabugPeer({
    localStorage: LOCAL_STORAGE,
    countVotes: COUNT_VOTES,
    disableValidation: true,
    peers: [
      window.location.origin + "/gun",
      //"https://notabug.io/gun",
    ]
  });

  window.notabug = notabugApi;

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

const onNotabugReceiveIdsData = update((state, thingData) => ({ thingData: { ...state.thingData, ...thingData } }));

const onNotabugPreloadFromUrl = (effects, url, preState={}) =>
  effects.getState().then(({ notabugApi, preloaded }) =>
    prop(url, preloaded)
      ? Promise.resolve().then(always(identity))
      : fetch(url)
        .then(response => {
          if (response.status !== 200) throw new Error("Bad response from server");
          return response.json();
        })
        .then(state => ({ ...state, ...preState }))
        .then(notabugApi.reconstituteState)
        .then(state => {
          if (state.data) {
            effects.onNotabugReceiveIdsData(state.data);
            delete state.data;
          }
          return state;
        })
        .then(notabugApi.mergeState)
        .then(always(assocPath(["preloaded", url], true))));

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
    const opIds = ids.map(notabugApi.getOpId).filter(x => !!x);
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

const onNotabugToggleInfiniteScroll = update(({ notabugInfiniteScroll }) =>
  ({ notabugInfiniteScroll: !notabugInfiniteScroll }));

const initialize = effects => effects.getState()
  .then(({ notabugApi }) => notabugApi.onLogin(effects.onLogin))
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
      onListenForReplies,
      onLogin
    }
  })
);
