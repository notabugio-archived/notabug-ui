import { provideState } from "freactal";
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

export const submissionDetailProvider = provideState({
  initialState,
});
