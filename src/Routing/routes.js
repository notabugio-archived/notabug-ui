import { ContentPolicy, PrivacyPolicy, UserAgreement, KnownPeers, Reddit } from "static";
import { cached } from "utils";
import { Topic } from "Listing";
import { SubmissionDetail } from "Submission/Detail";
import { SubmissionForm } from "Submission/Form";

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
const getProfileListingParams = withParams(({ params: { userid }, sort="new" }) => ({
  sort,
  authorIds: [userid]
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
    path: "/user/:userid/:sort",
    component: cached(Topic),
    getListingParams: getProfileListingParams
  }, {
    path: "/user/:userid",
    component: cached(Topic),
    getListingParams: getProfileListingParams
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
