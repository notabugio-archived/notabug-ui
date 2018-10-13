import { prop, always, identity } from "ramda";
import { provideState } from "freactal";

const initialState = ({ id, votableId, scope }) => ({
  notabugVotableId: votableId || id,
  notabugVotableScope: scope
});

const getNotabugVotableState = always(identity);

const isVotingDown = ({ notabugVotableId, notabugVoteQueue }) =>
  prop(notabugVotableId, notabugVoteQueue) === "down";

const isVotingUp = ({ notabugVotableId, notabugVoteQueue }) =>
  prop(notabugVotableId, notabugVoteQueue) === "up";

const onVoteUp = (effects) => effects.getNotabugVotableState()
  .then(({ notabugVotableId, notabugVotableScope: scope }) => {
    scope && scope.realtime();
    return effects.onNotabugQueueVote(notabugVotableId, "up");
  })
  .then(always(identity));

const onVoteDown = (effects) => effects.getNotabugVotableState()
  .then(({ notabugVotableId, notabugVotableScope: scope }) => {
    scope && scope.realtime();
    return effects.onNotabugQueueVote(notabugVotableId, "down");
  })
  .then(always(identity));

export const votingItemProvider = provideState({
  initialState,

  effects: { getNotabugVotableState, onVoteUp, onVoteDown },

  computed: { isVotingUp, isVotingDown }
});
