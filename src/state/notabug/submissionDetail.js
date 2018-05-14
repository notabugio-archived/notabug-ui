import Promise from "promise";
import { always, identity } from "ramda";
import { provideState, update } from "freactal";
import qs from "qs";

const initialState = (({
  location: { search },
  match: { params: { submission_id } }
}) => ({
  notabugSubmissionId: submission_id,
  notabugCommentsSort: qs.parse(search).sort || "best",
  notabugReplyToCommentId: null
}));

const notabugSubmission = ({ notabugSubmissionId, notabugSubmissions }) =>
  notabugSubmissions[notabugSubmissionId];

const getNotabugSubmissionDetailState = always(identity);

const onNotabugSetReplyTo = update((state, notabugReplyToCommentId) =>
  ({ notabugReplyToCommentId }));

const onNotabugSaveComment = (effects, body) => effects.getState()
  .then(notabugState => effects
    .getNotabugSubmissionDetailState().then(state => ({ ...notabugState, ...state })))
  .then(({ notabugApi, notabugSubmissionId, notabugReplyToCommentId }) => {
    return notabugApi.comment({
      body,
      opId: notabugSubmissionId,
      replyToId: notabugReplyToCommentId || notabugSubmissionId
    });
  })
  .then(node => (new Promise((resolve) => node.once(resolve))))
  .then(({ id }) => {
    effects.onNotabugMarkMine(id);
    effects.onNotabugSetReplyTo(null);
    effects.onNotabugQueueVote(id, "up");
  })
  .then(always(identity));

export const notabugSubmissionDetail = provideState({
  initialState,
  effects: {
    getNotabugSubmissionDetailState,
    onNotabugSetReplyTo,
    onNotabugSaveComment
  },
  computed: { notabugSubmission }
});

