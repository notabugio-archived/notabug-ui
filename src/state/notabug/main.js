/* globals Promise */
import { prop, compose, always, identity, assocPath } from "ramda";
import { provideState, update } from "freactal";
import { withRouter } from "react-router-dom";
import "gun";
import notabugPeer, { PREFIX } from "notabug-peer";

const COUNT_VOTES = !!(/countVotes/.test(window.location.search));
const LOCAL_STORAGE = !!(/localStorage/.test(window.location.search));

if (!(/nosea/.test(window.location.search))) {
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

const onNotabugPreloadFromUrl = (effects, url) =>
  effects.getState().then(({ notabugApi, preloaded }) =>
    prop(url, preloaded)
      ? Promise.resolve().then(always(identity))
      : fetch(url)
        .then(response => {
          if (response.status !== 200) throw new Error("Bad response from server");
          return response.json();
        })
        .then(notabugApi.reconstituteState)
        .then(notabugApi.mergeState)
        .then(always(assocPath(["preloaded", url], true))));

const onNotabugPreloadListing = (effects, listingProps) => effects.getState()
  .then(({ notabugApi }) => {
    const reducer = always(identity);
    if (listingProps.topics && listingProps.topics.length) {
      return Promise.all(listingProps.topics
        .map(topicName => effects.onNotabugPreloadFromUrl(`/api/topics/${topicName}.json`))
      ).then(reducer);
    } else if (listingProps.replyToId) {
      return effects.onNotabugPreloadFromUrl(`/api/submissions/${notabugApi.getOpId(listingProps.replyToId)}.json`).then(reducer);
    }
    return Promise.resolve().then(reducer);
  });

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
      onListenForReplies,
      onLogin
    }
  })
);
