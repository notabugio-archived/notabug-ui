import React from "react";
import { injectState } from "freactal";
import { notabugSubmissionForm } from "state";
import { SubmitPage } from "snew-classic-ui";
import { SUBMISSION_BODY_MAX, SUBMISSION_TITLE_MAX } from "lib/nab/validate";

const SubmissionFormBase = notabugSubmissionForm(injectState(({
  state: {
    submissionUrl,
    submissionTitle,
    submissionBody,
    submissionTopic,
    submissionIsSelf,
    isTitleInvalid,
    isUrlInvalid,
    isBodyInvalid
  },
  effects: {
    onChangeSubmissionUrl,
    onChangeSubmissionTitle,
    onChangeSubmissionBody,
    onChangeSubmissionTopic,
    onChangeSubmissionIsSelf,
    onSubmitSubmission
  },
}) => (
  <SubmitPage
    sitename="notabug"
    subname="topic"
    url={submissionUrl}
    text={submissionBody}
    title={submissionTitle}
    subreddit={submissionTopic}
    is_self={submissionIsSelf}
    textError={isBodyInvalid ?`this is too long (max: ${SUBMISSION_BODY_MAX})` : null}
    titleError={isTitleInvalid ? submissionTitle
      ? `this is too long (max: ${SUBMISSION_TITLE_MAX})`
      : "a title is required" : null}
    urlError={isUrlInvalid ? "this url is not valid" : null}
    onChangeUrl={e => onChangeSubmissionUrl(e.target.value)}
    onChangeTitle={e => onChangeSubmissionTitle(e.target.value)}
    onChangeText={e => onChangeSubmissionBody(e.target.value)}
    onChangeSubreddit={e => onChangeSubmissionTopic(e.target.value)}
    onChangeIsSelf={onChangeSubmissionIsSelf}
    onSubmit={e => { e.preventDefault(); onSubmitSubmission(); }}
  />
)));

export const SubmissionForm = props => (
  <SubmissionFormBase {...props} key={props.location.search} />
);
