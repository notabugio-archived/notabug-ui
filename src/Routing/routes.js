import { ContentPolicy, PrivacyPolicy, UserAgreement, KnownPeers, Reddit } from "static";
import { cached } from "utils";
import { Page } from "Page";
import { LoginSignupPage } from "Auth";
import { SubmissionForm } from "Submission/Form";
import { toRoute } from "./toRoute";
import { tabulator } from "../config.json";
import { PREFIX } from "notabug-peer";

const withParams = fn => (props) => ({ ...baseParams(props), ...fn(props) });
const baseParams = ({ params: { sort="hot" }={}, query: { count, limit }={} }={}) => ({
  sort,
  tabulator,
  count: parseInt(count, 10) || 0,
  limit: parseInt(limit, 10) || 25
});

const getPageParams = withParams(({ params: { prefix="t", identifier="all", sort="hot" } }) =>
  ({ prefix, soul: `${PREFIX}/${prefix}/${identifier}/${sort}@${tabulator}.` }));

const getFrontPageParams = withParams(({ params: { prefix="t", identifier="front", sort="hot" } }) =>
  ({ prefix, soul: `${PREFIX}/${prefix}/${identifier}/${sort}@${tabulator}.` }));

const getUserPageParams = withParams(({
  params: { prefix="user", identifier="all", sort="new", type="overview" }
}) => ({ prefix, type, sort, soul: `${PREFIX}/${prefix}/${identifier}/${type}/${sort}@${tabulator}.` }));

const getSubmissionListingParams = withParams((
  { params: { submission_id  }, query: { sort="best" } }
) => ({
  soul: `nab/things/${submission_id}/comments/${sort}@${tabulator}.`,
  sort,
  limit: null
}));

export const getFirehoseListingParams = withParams(({ withSubmissions }) => ({
  count: 0,
  soul: withSubmissions
    ? `nab/t/chat:whatever+comments:all+all/new@${tabulator}.`
    : `nab/t/chat:whatever/new@${tabulator}.`
}));

export const routes = [
  { path: "/help/privacypolicy", component: PrivacyPolicy },
  { path: "/help/useragreement", component: UserAgreement },
  { path: "/help/contentpolicy", component: ContentPolicy },
  { path: "/help/knownpeers", component: KnownPeers },
  { path: "/rules", component: ContentPolicy },
  { path: "/t/:topic/submit", component: SubmissionForm },
  { path: "/login", component: LoginSignupPage },
  { path: "/submit", component: SubmissionForm },
  { path: "/r/*", component: Reddit },
  {
    path: "/:prefix/:identifier/comments/:submission_id/:slug",
    component: cached(Page),
    getListingParams: getSubmissionListingParams
  }, {
    path: "/:prefix/:identifier/comments/:submission_id",
    component: cached(Page),
    getListingParams: getSubmissionListingParams
  }, {
    path: "/message/comments",
    component: Page,
    getListingParams: withParams(({ userId }) => ({
      soul: `nab/user/${userId}/replies/comments/new@${tabulator}.`
    }))
  }, {
    path: "/message/selfreply",
    component: Page,
    getListingParams: withParams(({ userId }) => ({
      soul: `nab/user/${userId}/replies/submitted/new@${tabulator}.`
    }))
  }, {
    path: "/message/inbox",
    component: Page,
    getListingParams: withParams(({ userId }) => ({
      soul: `nab/user/${userId}/replies/overview/new@${tabulator}.`
    }))
  }, {
    path: "/listing/:soul(.+)",
    component: Page,
    getListingParams: withParams(({ params: { soul } }) => ({ soul: `${PREFIX}/${soul}` }))
  }, {
    path: "/user/~:identifier/:type/:sort",
    component: cached(Page),
    getListingParams: getUserPageParams
  }, {
    path: "/user/~identifier/:type",
    component: cached(Page),
    getListingParams: getUserPageParams
  }, {
    path: "/user/~:identifier",
    component: cached(Page),
    getListingParams: getUserPageParams
  }, {
    path: "/user/:identifier/:type/:sort",
    component: cached(Page),
    getListingParams: getUserPageParams
  }, {
    path: "/user/:identifier/:type",
    component: cached(Page),
    getListingParams: getUserPageParams
  }, {
    path: "/user/:identifier",
    component: cached(Page),
    getListingParams: getUserPageParams
  }, {
    path: "/:prefix/:identifier/:sort",
    component: cached(Page),
    getListingParams: getPageParams
  }, {
    path: "/:prefix/:identifier",
    component: cached(Page),
    getListingParams: getPageParams
  }, {
    path: "/:sort",
    component: cached(Page),
    getListingParams: getFrontPageParams
  }, {
    path: "/",
    exact: true,
    component: cached(Page),
    getListingParams: getFrontPageParams
  }
].map(toRoute);
