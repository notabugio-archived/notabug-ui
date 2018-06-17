import compose from "ramda/es/compose";
import always from "ramda/es/always";
import identity from "ramda/es/identity";
import assocPath from "ramda/es/assocPath";
import { provideState, update } from "freactal";
import { withRouter } from "react-router-dom";
import "babel-polyfill";
import notabugPeer, { PREFIX } from "notabug-peer";

const COUNT_VOTES = !(/countVotes/.test(window.location.search));

if (!(/nosea/.test(window.location.search))) {
  require("sea");
}

const initialState = ({ history }) => {
  const notabugApi = notabugPeer({
    localStorage: true,
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
    myContent: {}
  };
};

const getState = always(identity);

const onNotabugMarkMine = (effects, id) => {
  //effects.onListenForReplies(id); // TODO: this is currently broken
  return effects.getState()
    .then(() => assocPath(["myContent", id], true));
};

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
      onListenForReplies,
      onLogin
    }
  })
);
