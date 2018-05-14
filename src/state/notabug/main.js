import { compose, always, identity } from "ramda";
import { provideState, update } from "freactal";
import { init } from "lib/nab";
import { withRouter } from "react-router-dom";

const initialState = ({ history }) => ({
  history,
  notabugApi: init(),
  myContent: {}
});

const getState = always(identity);
const onCreateSubmission = (effects, { title, body="", topic="whatever" }) => effects.getState()
  .then(({ notabugApi }) => notabugApi.submit({ title, body, topic }))
  .then(thing => thing.one(({ id }) => effects.onNotabugMarkMine(id)))
  .then(always(identity));

const onNotabugMarkMine = update((state, id) => ({ myContent: { ...state.myContent, [id]: true } }));

export const notabug = compose(
  withRouter, provideState({
    initialState,
    effects: {
      getState,
      onCreateSubmission,
      onNotabugMarkMine
    }
  })
);
