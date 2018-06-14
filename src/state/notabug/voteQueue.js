import always from "ramda/es/always";
import identity from "ramda/es/identity";
import { provideState, update } from "freactal";
import { doWork } from "pow";
import { PREFIX } from "notabug-peer";

const initialState = always({
  notabugVoteWorker: null,
  notabugVoteQueue: {}
});

const initialize = effects => effects.onNotabugStartNextVote().then(always(identity));

const getNotabugVoteQueueState = always(identity);

const onNotabugAddVoteToQueue = update((state, id, type) =>
  ({ notabugVoteQueue: { ...state.notabugVoteQueue, [id]: type } }));

const setNotabugVoteWorker = update((state, notabugVoteWorker) => ({ notabugVoteWorker }));

const onNotabugDequeueVote = update((state, id) => {
  const notabugVoteQueue = { ...state.notabugVoteQueue };
  delete notabugVoteQueue[id];
  return { notabugVoteQueue };
});

const onNotabugQueueVote = (effects, id, type) => effects
  .onNotabugAddVoteToQueue(id, type)
  .then(({ notabugVoteWorker }) => !notabugVoteWorker && effects.onNotabugStartNextVote())
  .then(always(identity));

const onNotabugVoteCalculated = (effects, id, kind, nonce) => effects.getState()
  .then(notabugState => effects
    .getNotabugVoteQueueState().then(state => ({ ...notabugState, ...state })))
  .then(({ notabugApi }) => notabugApi.vote(id, kind, nonce))
  .then(always(identity));

const onNotabugVoteQueueTerminateWorker = effects => effects.getNotabugVoteQueueState()
  .then(({ notabugVoteWorker }) => notabugVoteWorker && notabugVoteWorker.terminate())
  .then(() => state => ({ ...state, notabugVoteWorker: null }));

const onNotabugStartNextVote = (effects) => effects.getNotabugVoteQueueState()
  .then(({ notabugVoteQueue, notabugVoteWorker }) => {
    const nextId = Object.keys(notabugVoteQueue).pop();

    if (notabugVoteWorker || !nextId) return always(identity);

    const type = notabugVoteQueue[nextId];
    const worker = doWork(`${PREFIX}/things/${nextId}/votes${type}`);

    if (!type) return always(identity);

    return effects.setNotabugVoteWorker(worker)
      .then(() => worker.then())
      .then(nonce => effects.onNotabugVoteCalculated(nextId, type, nonce))
      .then(() => effects.onNotabugDequeueVote(nextId))
      .then(() => effects.onNotabugVoteQueueTerminateWorker())
      .then(() => effects.onNotabugStartNextVote())
      .then(() => state => ({
        ...state,
        notabugVoteQueue: { ...state.notabugVoteQueue, [nextId]: undefined }
      }));
  });

export const notabugVoteQueue = provideState({
  initialState,
  effects: {
    initialize,
    getNotabugVoteQueueState,
    setNotabugVoteWorker,
    onNotabugAddVoteToQueue,
    onNotabugQueueVote,
    onNotabugDequeueVote,
    onNotabugStartNextVote,
    onNotabugVoteCalculated,
    onNotabugVoteQueueTerminateWorker
  }
});
