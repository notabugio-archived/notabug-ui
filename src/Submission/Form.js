import React, { useState, useCallback, useMemo } from "react";
import { useNotabug } from "NabContext";
import { ZalgoPromise as Promise } from "zalgo-promise";
import qs from "qs";
import slugify from "utils/slugify";
import urllite from "urllite";
import {
  MAX_TOPIC_SIZE,
  MAX_THING_BODY_SIZE,
  MAX_THING_TITLE_SIZE
} from "notabug-peer";
import { SubmitPage } from "snew-classic-ui";
import { PageTemplate, PageFooter } from "Page";
import { Link, JavaScriptRequired } from "utils";

const preventDefault = fn => evt => {
  evt && evt.preventDefault();
  return fn(evt);
};

export const SubmissionForm = ({
  location: { search },
  match: {
    params: { topic: initialTopic = "whatever" }
  }
}) => {
  const { api, history, onMarkMine } = useNotabug();
  const query = qs.parse(search, { ignoreQueryPrefix: true });
  const [topic, setTopic] = useState(initialTopic || "whatever");
  const [title, setTitle] = useState(query.title || "");
  const [body, setBody] = useState(query.body || "");
  const [url, setUrl] = useState(query.url || "");
  const [isSelf, setIsSelf] = useState(!!/selftext=true/.test(search));

  const isBodyInvalid = body.length > MAX_THING_BODY_SIZE;
  const isTitleInvalid = title.length > MAX_THING_TITLE_SIZE;
  const isTopicInvalid = !topic || topic.length > MAX_TOPIC_SIZE;
  const isUrlInvalid = useMemo(
    () => {
      if (isSelf) return false;
      if (!url) return true;
      const { host, protocol } = urllite(url) || {};
      if (host && protocol) return false;
      return true;
    },
    [isSelf, url]
  );
  const isInvalid =
    isBodyInvalid || isTitleInvalid || isTopicInvalid || isUrlInvalid;

  const onChangeTitle = useCallback(
    preventDefault(evt => setTitle(evt.target.value)),
    []
  );
  const onChangeTopic = useCallback(
    preventDefault(evt => setTopic(evt.target.value)),
    []
  );
  const onChangeUrl = useCallback(
    preventDefault(evt => setUrl(evt.target.value)),
    []
  );
  const onChangeBody = useCallback(
    preventDefault(evt => setBody(evt.target.value)),
    []
  );
  const onChangeIsSelf = useCallback(isSelf => setIsSelf(!!isSelf), []);

  const onSubmitSubmission = useCallback(
    preventDefault(
      () => {
        if (isInvalid) return Promise.resolve();
        api.scope.realtime();
        return api
          .submit({ title, body, topic, url: isSelf ? null : url })
          .then(({ id }) => {
            onMarkMine(id);
            history.replace(
              `/t/${topic}/comments/${id}/${slugify(title).toLowerCase()}`
            );
          });
      },
      [topic, title, body, url, isSelf, isInvalid]
    )
  );

  return (
    <PageTemplate submitTopic={topic}>
      <JavaScriptRequired>
        <SubmitPage
          Link={Link}
          sitename="notabug"
          siteprefix="t"
          subname="topic"
          url={url}
          text={body}
          title={title}
          subreddit={topic.toLowerCase()}
          is_self={isSelf}
          contentPolicyUrl="/rules"
          textError={
            isBodyInvalid
              ? `this is too long (max: ${MAX_THING_BODY_SIZE})`
              : null
          }
          titleError={
            isTitleInvalid
              ? title
                ? `this is too long (max: ${MAX_THING_TITLE_SIZE})`
                : "a title is required"
              : null
          }
          subredditError={
            isTopicInvalid
              ? topic
                ? `this is too long (max: ${MAX_TOPIC_SIZE})`
                : "a topic is required"
              : null
          }
          urlError={isUrlInvalid ? "this url is not valid" : null}
          onChangeUrl={onChangeUrl}
          onChangeTitle={onChangeTitle}
          onChangeText={onChangeBody}
          onChangeSubreddit={onChangeTopic}
          onChangeIsSelf={onChangeIsSelf}
          onSubmit={onSubmitSubmission}
          SelfPostInfobar={() => (
            <div className="infobar" id="text-desc">
              You are submitting a text-based post. Speak your mind. A title is
              required, but expanding further in the text field is not. It is
              suggested that you put your post in a topic that is relevant.
            </div>
          )}
          LinkPostInfobar={() => (
            <div className="infobar" id="link-desc">
              You are submitting a link. Links to videos and images can be
              displayed as embedded content on the site. It is suggested that
              you submit direct links when posting images or videos.
            </div>
          )}
        />
      </JavaScriptRequired>
      <PageFooter />
    </PageTemplate>
  );
};
