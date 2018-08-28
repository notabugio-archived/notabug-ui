import React from "react";
import { Topic } from "./Topic";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionDetail } from "./SubmissionDetail";
import { ContentPolicy } from "../ContentPolicy";
import { PrivacyPolicy } from "../PrivacyPolicy";
import { UserAgreement } from "../UserAgreement";
import { KnownPeers } from "../KnownPeers";
import { cached } from "./Cached";

const UserProfile = () => (
  <div className="reddit-infobar">
    <h1>User profiles not implemented yet, Sorry!</h1>
    <h4>
      They will be, in classic open-source reddit style with karma counts, and orangereds plus encrypted private messaging.   Be patient, or help out
    </h4>
    <h4>Your current contributions will be on your profile when they are ready</h4>
  </div>
);

const Reddit = ({ location: { pathname, search } }) => (
  <div className="reddit-infobar">
    <h1>This isn't snew</h1>
    <h4>
      {"Yes they share some code, but you're looking for "}
      <a href={`https://snew.github.io${pathname}${search}`}>snew.github.io</a>
    </h4>
    <p>notabug does not rely on reddit's servers, api or content at all; it's its own network.</p>
    <p>Only the open-source UI code from reddit is used.</p>
  </div>
);

const baseParams = ({ params: { sort="hot" }, query: { count, limit } }) => ({
  sort,
  count: parseInt(count, 10) || 0,
  limit: parseInt(limit, 10) || 25,
  days: parseInt(limit, 10) || 90,
});

const withParams = fn => (props) => {
  const base = baseParams;
  return { ...base, ...fn(props) };
};


const getTopicListingParams = withParams(({ params: { topic="all" } }) => ({ topics: [topic] }));
const getDomainListingParams = withParams(({ params: { domain } }) => ({ domain }));
const getSubmissionListingParams = withParams((
  { params: { submission_id: opId  }, query: { sort="best" } }
) => ({ opId, sort }));
const getFirehoseListingParams = withParams(() => ({
  topics: ["chat:whatever", "comments:all", "all"],
  sort: "new",
  days: 3
}));

export const routes = [
  {
    path: "/help/privacypolicy",
    component: PrivacyPolicy
  }, {
    path: "/help/useragreement",
    component: UserAgreement
  }, {
    path: "/help/contentpolicy",
    component: ContentPolicy
  }, {
    path: "/help/knownpeers",
    component: KnownPeers
  }, {
    path: "/rules",
    component: ContentPolicy
  }, {
    path: "/t/:topic/comments/:submission_id/:slug",
    component: cached(SubmissionDetail),
    getListingParams: getSubmissionListingParams
  }, {
    path: "/t/:topic/comments/:submission_id",
    component: cached(SubmissionDetail),
    getListingParams: getSubmissionListingParams
  }, {
    path: "/t/:topic/submit",
    component: cached(SubmissionForm)
  }, {
    path: "/t/:topic/chat",
    getListingParams: getFirehoseListingParams
  }, {
    path: "/t/:topic/:sort",
    component: cached(Topic),
    getListingParams: getTopicListingParams
  }, {
    path: "/t/:topic",
    component: cached(Topic),
    getListingParams: getTopicListingParams
  }, {
    path: "/domain/:domain/:sort",
    component: cached(Topic),
    getListingParams: getDomainListingParams
  }, {
    path: "/domain/:domain",
    component: cached(Topic),
    getListingParams: getDomainListingParams
  }, {
    path: "/user/:username",
    component: UserProfile
  }, {
    path: "/r/*",
    component: Reddit
  }, {
    path: "/submit",
    component: SubmissionForm
  }, {
    path: "/login",
  }, {
    path: "/chat",
    getListingParams: getFirehoseListingParams
  }, {
    path: "/:sort",
    component: cached(Topic),
    getListingParams: getTopicListingParams
  }, {
    path: "/",
    exact: true,
    component: cached(Topic),
    getListingParams: getTopicListingParams
  }
];
