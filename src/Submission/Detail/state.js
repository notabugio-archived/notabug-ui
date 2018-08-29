import { always, identity } from "ramda";
import { provideState, update } from "freactal";
import qs from "qs";

const initialState = (({
  location: { search },
  match: { params: { submission_id, topic } }
}) => ({
  notabugSubmissionId: submission_id,
  notabugSubmissionTopic: topic,
  notabugCommentsSort: qs.parse(search).sort || "best",
  replied: false,
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
  .then(({ notabugApi, notabugSubmissionId, notabugSubmissionTopic, notabugReplyToCommentId }) => {
    return notabugApi.comment({
      body,
      opId: notabugSubmissionId,
      topic: notabugSubmissionTopic,
      replyToId: notabugReplyToCommentId || notabugSubmissionId
    });
  })
  .then(({ id }) => {
    effects.onNotabugMarkMine(id);
    effects.onNotabugSetReplyTo(null);
  })
  .then(() => state => ({ ...state, replied: true }));

export const submissionDetailProvider = provideState({
  initialState,
  effects: {
    getNotabugSubmissionDetailState,
    onNotabugSetReplyTo,
    onNotabugSaveComment
  },
  computed: { notabugSubmission }
});
