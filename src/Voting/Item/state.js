import { prop, always, identity } from "ramda";
import { provideState } from "freactal";

const initialState = ({ id, votableId, listing }) => ({
  notabugVotableId: votableId || id,
  notabugVotableListing: listing
});

const getNotabugVotableState = always(identity);

const isVotingDown = ({ notabugVotableId, notabugVoteQueue }) =>
  prop(notabugVotableId, notabugVoteQueue) === "down";

const isVotingUp = ({ notabugVotableId, notabugVoteQueue }) =>
  prop(notabugVotableId, notabugVoteQueue) === "up";

const onVoteUp = (effects) => effects.getNotabugVotableState()
  .then(({ notabugVotableId, notabugVotableListing: listing }) => {
    listing && listing.scope && listing.scope.realtime();
    return effects.onNotabugQueueVote(notabugVotableId, "up");
  })
  .then(always(identity));

const onVoteDown = (effects) => effects.getNotabugVotableState()
  .then(({ notabugVotableId, notabugVotableListing: listing }) => {
    listing && listing.scope && listing.scope.realtime();
    return effects.onNotabugQueueVote(notabugVotableId, "down");
  })
  .then(always(identity));

export const votingItemProvider = provideState({
  initialState,

  effects: { getNotabugVotableState, onVoteUp, onVoteDown },

  computed: { isVotingUp, isVotingDown }
});
