import { always, identity } from "ramda";
import { provideState, update } from "freactal";
import { PREFIX } from "notabug-peer";
import { doWork } from "./pow";

const initialState = always({
  notabugWorkPromise: null,
  notabugVoteQueue: {}
});

const initialize = effects => effects.onNotabugStartNextVote().then(always(identity));

const getNotabugVoteQueueState = always(identity);

const onNotabugAddVoteToQueue = update((state, id, type) =>
  ({ notabugVoteQueue: { ...state.notabugVoteQueue, [id]: type } }));

const setNotabugWorkPromise = update((state, notabugWorkPromise) => ({ notabugWorkPromise }));

const onNotabugDequeueVote = update((state, id) => {
  const notabugVoteQueue = { ...state.notabugVoteQueue };
  delete notabugVoteQueue[id];
  return { notabugVoteQueue };
});

const onNotabugQueueVote = (effects, id, type) => effects
  .onNotabugAddVoteToQueue(id, type)
  .then(({ notabugWorkPromise }) => !notabugWorkPromise && effects.onNotabugStartNextVote())
  .then(always(identity));

const onNotabugVoteCalculated = (effects, id, kind, nonce) => effects.getState()
  .then(notabugState => effects
    .getNotabugVoteQueueState().then(state => ({ ...notabugState, ...state })))
  .then(({ notabugApi }) => notabugApi.vote(id, kind, nonce))
  .then(always(identity));

const onNotabugVoteQueueFinishedWork = update(always({ notabugWorkPromise: null }));

const onNotabugStartNextVote = (effects) => effects.getNotabugVoteQueueState()
  .then(({ notabugVoteQueue, notabugWorkPromise }) => {
    const nextId = Object.keys(notabugVoteQueue).pop();

    if (notabugWorkPromise || !nextId) return always(identity);

    const type = notabugVoteQueue[nextId];
    const workPromise = doWork(`${PREFIX}/things/${nextId}/votes${type}`);

    if (!type) return always(identity);

    return effects.setNotabugWorkPromise(workPromise)
      .then(() => workPromise.then())
      .then(nonce => effects.onNotabugVoteCalculated(nextId, type, nonce))
      .then(() => effects.onNotabugDequeueVote(nextId))
      .then(() => effects.onNotabugVoteQueueFinishedWork())
      .then(() => effects.onNotabugStartNextVote())
      .then(() => state => ({
        ...state,
        notabugVoteQueue: { ...state.notabugVoteQueue, [nextId]: undefined }
      }));
  });

export const votingProvider = provideState({
  initialState,
  effects: {
    initialize,
    getNotabugVoteQueueState,
    setNotabugWorkPromise,
    onNotabugAddVoteToQueue,
    onNotabugQueueVote,
    onNotabugDequeueVote,
    onNotabugStartNextVote,
    onNotabugVoteCalculated,
    onNotabugVoteQueueFinishedWork
  }
});
