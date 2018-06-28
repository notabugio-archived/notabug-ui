import { prop, always, identity } from "ramda";
import { provideState } from "freactal";

const initialState = ({ votableId }) => ({
  notabugVotableId: votableId
});

const getNotabugVotableState = always(identity);

const isVotingDown = ({ notabugVotableId, notabugVoteQueue }) =>
  prop(notabugVotableId, notabugVoteQueue) === "down";

const isVotingUp = ({ notabugVotableId, notabugVoteQueue }) =>
  prop(notabugVotableId, notabugVoteQueue) === "up";

const onVoteUp = (effects) => effects.getNotabugVotableState()
  .then(({ notabugVotableId }) =>
    effects.onNotabugQueueVote(notabugVotableId, "up"))
  .then(always(identity));

const onVoteDown = (effects) => effects.getNotabugVotableState()
  .then(({ notabugVotableId }) =>
    effects.onNotabugQueueVote(notabugVotableId, "down"))
  .then(always(identity));

export const notabugVotable = provideState({
  initialState,

  effects: { getNotabugVotableState, onVoteUp, onVoteDown },

  computed: { isVotingUp, isVotingDown }
});
