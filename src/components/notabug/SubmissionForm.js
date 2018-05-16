import React from "react";
import { injectState } from "freactal";
import { notabugSubmissionForm } from "state";
import { SubmitPage } from "snew-classic-ui";
import { TOPIC_NAME_MAX, SUBMISSION_BODY_MAX, SUBMISSION_TITLE_MAX } from "lib/nab/validate";

const SubmissionFormBase = notabugSubmissionForm(injectState(({
  state: {
    submissionUrl,
    submissionTitle,
    submissionBody,
    submissionTopic,
    submissionIsSelf,
    isTitleInvalid,
    isUrlInvalid,
    isTopicInvalid,
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
  match: { params: { topic } }
}) => (
  <SubmitPage
    key={topic}
    sitename="notabug"
    siteprefix="t"
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
    subredditError={isTopicInvalid ? submissionTopic
      ? `this is too long (max: ${TOPIC_NAME_MAX})`
      : "a topic is required" : null}
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
