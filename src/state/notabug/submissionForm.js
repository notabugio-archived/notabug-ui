import Promise from "promise";
import { always, identity } from "ramda";
import { update, provideState } from "freactal";
import slugify from "slugify";
import urllite from "urllite";
import { SUBMISSION_BODY_MAX, SUBMISSION_TITLE_MAX } from "lib/nab/validate";

const initialState = ({ location: { search } }) => ({
  submissionTitle: "",
  submissionBody: "",
  submissionUrl: "",
  submissionTopic: "whatever",
  submissionIsSelf: !!(/selftext=true/).test((search))
});

const getSubmissionFormState = always(identity);
const onChangeSubmissionTitle = update((state, submissionTitle) => ({ submissionTitle }));
const onChangeSubmissionBody = update((state, submissionBody) => ({ submissionBody }));
const onChangeSubmissionIsSelf = update((state, submissionIsSelf) => ({ submissionIsSelf }));
const onChangeSubmissionTopic = update((state, submissionTopic) => ({ submissionTopic }));
const onChangeSubmissionUrl = update((state, submissionUrl) => ({ submissionUrl }));
const onSubmitSubmission = (effects) => effects.getSubmissionFormState()
  .then(state => effects.getState().then(baseState => ({ ...baseState,  ...state })))
  .then((state) => {
    const {
      notabugApi, submissionTitle, submissionBody, submissionUrl, submissionTopic, submissionIsSelf
    } = state;
    if (isUrlInvalid(state) || isTitleInvalid(state) || isBodyInvalid(state)) return;
    return Promise.resolve(notabugApi
      .submit({
        title: submissionTitle,
        body: submissionIsSelf ? submissionBody : null,
        topic: submissionTopic,
        url: submissionIsSelf ? null : submissionUrl
      }))
      .then(node => (new Promise((resolve) => node.once(resolve))))
      .then(({ id }) => {
        effects.onNotabugQueueVote(id, "up");
        effects.pushRouterState(`/t/${submissionTopic}/comments/${id}/${slugify(submissionTitle).toLowerCase()}`);
      });
  })
  .then(always(identity));

const isUrlInvalid = ({ submissionIsSelf, submissionUrl }) => {
  if (submissionIsSelf) return false;
  if (!submissionUrl) return true;
  const url = urllite(submissionUrl);
  if (url.host && url.protocol) return false;
  return true;
};

const isBodyInvalid = ({ submissionBody }) => submissionBody.length > SUBMISSION_BODY_MAX;
const isTitleInvalid = ({ submissionTitle }) => !submissionTitle || (submissionTitle.length > SUBMISSION_TITLE_MAX);

export const notabugSubmissionForm = provideState({
  initialState,
  effects: {
    getSubmissionFormState,
    onChangeSubmissionTitle,
    onChangeSubmissionBody,
    onChangeSubmissionTopic,
    onChangeSubmissionUrl,
    onChangeSubmissionIsSelf,
    onSubmitSubmission
  },
  computed: { isUrlInvalid, isBodyInvalid, isTitleInvalid }
});
