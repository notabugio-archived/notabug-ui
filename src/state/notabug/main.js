import { compose, always, identity, assocPath } from "ramda";
import { provideState } from "freactal";
import { init } from "lib/nab";
import { PREFIX } from "lib/nab/etc";
import { withRouter } from "react-router-dom";

const initialState = ({ history }) => ({
  history,
  notabugApi: init(),
  myContent: {}
});

const getState = always(identity);

const onNotabugMarkMine = (effects, id) => {
  effects.onListenForReplies(id);
  return effects.getState()
    .then(() => assocPath(["myContent", id], true));
};

const onListenForReplies = (effects, id) => effects.getState()
  .then(({ notabugApi }) => {
    notabugApi.gun.get(`${PREFIX}/things/${id}`).get("comments").map().once(({ id }) => {
      let hasNotified = false;
      notabugApi.gun.get(`${PREFIX}/things/${id}`).get("votesup").map().once(() => {
        if (hasNotified) return;
        hasNotified = true;
        notabugApi.gun.get(`${PREFIX}/things/${id}/data`).once(({ opId }) => {
          notabugApi.gun.get(`${PREFIX}/things/${opId}/data`).once(({ title, topic }) =>
            effects.onNotifyUser({
              title: "Comment reply in " + topic,
              body: "on: " + title,
              onOpen: () => effects.pushRouterState(`/t/${topic}/comments/${opId}/`)
            })
          );
        });
      });
    });
    return state => state;
  });


export const notabug = compose(
  withRouter, provideState({
    initialState,
    effects: {
      getState,
      onNotabugMarkMine,
      onListenForReplies
    }
  })
);
