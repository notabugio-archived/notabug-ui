import { ContentPolicy, PrivacyPolicy, UserAgreement, KnownPeers, Reddit } from "static";
import { cached } from "utils";
import { Topic } from "Listing";
import { SubmissionDetail } from "Submission/Detail";
import { SubmissionForm } from "Submission/Form";
import { toRoute } from "./toRoute";
import { tabulator } from "../config.json";

const baseParams = ({ params: { sort="hot" }={}, query: { count, limit }={} }={}) => ({
  sort,
  tabulator,
  count: parseInt(count, 10) || 0,
  limit: parseInt(limit, 10) || 25,
  days: parseInt(limit, 10) || 90,
});

const withParams = fn => (props) => ({ ...baseParams(props), ...fn(props) });

const getTopicListingParams = withParams(({ params: { sort="hot", topic="all" } }) =>
  ({ soul: `nab/t/${topic}/${sort}@${tabulator}.` }));

const getDomainListingParams = withParams(({ params: { sort="hot", domain } }) =>
  ({ soul: `nab/domain/${domain}/${sort}@${tabulator}.` }));

const getSubmissionListingParams = withParams((
  { params: { submission_id  }, query: { sort="best" } }
) => ({
  soul: `nab/things/${submission_id}/comments/${sort}@${tabulator}.`,
  sort,
  days: null,
  limit: null
}));

export const getFirehoseListingParams = withParams(({ withSubmissions }) => ({
  soul: withSubmissions
    ? `nab/t/chat:whatever+comments:all+all/new@${tabulator}.`
    : `nab/t/chat:whatever/new@${tabulator}.`
}));

const getProfileListingParams = withParams((
  { params: { userid, type="overview" }, query: { sort="new" } }
) => ({ authorIds: userid.split("+"), soul: `nab/user/${userid}/${type}/${sort}@${tabulator}.`, sort }));

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
    path: "/message/comments",
    component: Topic,
    getListingParams: withParams(({ userId }) => ({
      soul: `nab/user/${userId}/replies/comments/new@${tabulator}.`
    }))
  }, {
    path: "/message/selfreply",
    component: Topic,
    getListingParams: withParams(({ userId }) => ({
      soul: `nab/user/${userId}/replies/submitted/new@${tabulator}.`
    }))
  }, {
    path: "/message/inbox",
    component: Topic,
    getListingParams: withParams(({ userId }) => ({
      soul: `nab/user/${userId}/replies/all/new@${tabulator}.`
    }))
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
    component: SubmissionForm
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
    path: "/user/~:userid/:type/:sort",
    component: cached(Topic),
    getListingParams: getProfileListingParams
  }, {
    path: "/user/~:userid/:type",
    component: cached(Topic),
    getListingParams: getProfileListingParams
  }, {
    path: "/user/~:userid",
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
].map(toRoute);
