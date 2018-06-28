import { compose, always, identity } from "ramda";
import { provideState } from "freactal";
import { withRouter } from "react-router-dom";


const initialState = ({ history }) => ({
  routerHistory: history
});

const getRouterState = always(identity);

const pushRouterState = (effects, ...args) => effects.getRouterState()
  .then(({ routerHistory }) => routerHistory.push(...args))
  .then(getRouterState);

const replaceRouterState = (effects, ...args) => effects.getRouterState()
  .then(({ routerHistory }) => routerHistory.replace(...args))
  .then(getRouterState);

export const router = compose(
  withRouter,
  provideState({
    initialState,
    effects: { getRouterState, pushRouterState, replaceRouterState }
  })
);
