import React from "react";
import { injectState } from "freactal";
import { SubmitPage } from "snew-classic-ui";
import { Link, JavaScriptRequired, locationKey } from "utils";
import { TOPIC_NAME_MAX, SUBMISSION_BODY_MAX, SUBMISSION_TITLE_MAX } from "notabug-peer";
import { PageTemplate, PageFooter } from "Page";
import { submissionFormProvider } from "./state";

export const SubmissionFormBase = ({
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
  <PageTemplate submitTopic={submissionTopic}>
    <JavaScriptRequired>
      <SubmitPage
        Link={Link}
        key={topic}
        sitename="notabug"
        siteprefix="t"
        subname="topic"
        url={submissionUrl}
        text={submissionBody}
        title={submissionTitle}
        subreddit={submissionTopic.toLowerCase()}
        is_self={submissionIsSelf}
        contentPolicyUrl="/rules"
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
        SelfPostInfobar={() => (
          <div className="infobar" id="text-desc">
            You are submitting a text-based post. Speak your mind. A title is required, but expanding further in the text field is not. It is suggested that you put your post in a topic that is relevant.
          </div>
        )}
        LinkPostInfobar={() => (
          <div className="infobar" id="link-desc">
            You are submitting a link. Links to videos and images can be displayed as embedded content on the site. It is suggested that you submit direct links to images or videos.
          </div>
        )}
      />
    </JavaScriptRequired>
    <PageFooter />
  </PageTemplate>
);

export const SubmissionForm = locationKey(submissionFormProvider(injectState(SubmissionFormBase)));
