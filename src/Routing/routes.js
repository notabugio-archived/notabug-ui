import { StaticPage, Reddit } from "static";
import { cached } from "utils";
import { Page } from "Page";
import { SpaceListingPage } from "Space";
import { LoginSignupPage } from "Auth";
import { SubmissionForm } from "Submission/Form";
import { WikiPage } from "Wiki";
import { toRoute } from "./toRoute";
import { tabulator } from "../config.json";
import { PREFIX } from "notabug-peer";
import { getWikiPage } from "notabug-peer/listings";

const withParams = fn => props => ({ ...baseParams(props), ...fn(props) });
const baseParams = ({
  params: { sort = "hot" } = {},
  query: { indexer = tabulator, count, limit } = {}
} = {}) => ({
  sort,
  indexer,
  count: parseInt(count, 10) || 0,
  limit: parseInt(limit, 10) || 25
});

const getPageParams = withParams(
  ({
    params: { prefix = "t", identifier = "all", sort = "hot" },
    query: { indexer = tabulator }
  }) => ({
    prefix,
    soul: `${PREFIX}/${prefix}/${identifier}/${sort}@~${indexer}.`
  })
);

const getUserPageParams = withParams(
  ({
    params: {
      prefix = "user",
      identifier = tabulator,
      sort = "new",
      type = "overview"
    },
    query: { indexer = tabulator }
  }) => ({
    prefix,
    type,
    sort,
    soul: `${PREFIX}/${prefix}/${identifier}/${type}/${sort}@~${indexer}.`
  })
);

const getUserSpaceParams = withParams(
  ({
    params: { identifier = tabulator, name = "frontpage", sort = null }
  }) => {
    return {
      owner: identifier,
      name,
      sort
    };
  }
);

const getSubmissionListingParams = withParams(
  ({
    params: { submission_id },
    query: { sort = "best" },
    query: { indexer = tabulator }
  }) => ({
    soul: `nab/things/${submission_id}/comments/${sort}@~${indexer}.`,
    sort,
    limit: null
  })
);

export const getFirehoseListingParams = withParams(
  ({ withSubmissions, query: { indexer = tabulator } = {} }) => ({
    count: 0,
    limit: 50,
    soul: withSubmissions
      ? `nab/t/front/firehose@~${indexer}.`
      : `nab/t/front/chat@~${indexer}.`
  })
);

export const routes = [
  {
    path: "/help/:name",
    component: cached(StaticPage),
    preload: (scope, { params: { name } }) =>
      getWikiPage(scope, tabulator, name)
  },
  { path: "/t/:topic/submit", component: SubmissionForm },
  { path: "/login", component: LoginSignupPage },
  { path: "/submit", component: SubmissionForm },
  { path: "/r/*", component: Reddit },
  {
    path: "/:prefix/:identifier/comments/:submission_id/:slug",
    component: cached(Page),
    getListingParams: getSubmissionListingParams
  },
  {
    path: "/:prefix/:identifier/comments/:submission_id",
    component: cached(Page),
    getListingParams: getSubmissionListingParams
  },
  {
    path: "/message/comments",
    component: Page,
    getListingParams: withParams(
      ({ userId, query: { indexer = tabulator } }) => ({
        soul: `nab/user/${userId}/replies/comments/new@~${indexer}.`
      })
    )
  },
  {
    path: "/message/selfreply",
    component: Page,
    getListingParams: withParams(
      ({ userId, query: { indexer = tabulator } }) => ({
        soul: `nab/user/${userId}/replies/submitted/new@~${indexer}.`
      })
    )
  },
  {
    path: "/message/inbox",
    component: Page,
    getListingParams: withParams(
      ({ userId, query: { indexer = tabulator } }) => ({
        soul: `nab/user/${userId}/replies/overview/new@~${indexer}.`
      })
    )
  },
  {
    path: "/listing/:soul(.+)",
    component: Page,
    getListingParams: withParams(({ params: { soul } }) => ({
      soul: `${PREFIX}/${soul}`
    }))
  },
  {
    path: "/user/:identifier/pages/:name",
    component: cached(WikiPage),
    preload: (scope, { params: { identifier, name } }) =>
      getWikiPage(scope, identifier, name)
  },
  {
    path: "/user/:identifier/pages",
    component: cached(WikiPage)
  },
  {
    path: "/user/:identifier/spaces/:name/:sort",
    component: cached(SpaceListingPage),
    getSpaceParams: getUserSpaceParams
  },
  {
    path: "/user/:identifier/spaces/:name",
    component: cached(SpaceListingPage),
    getSpaceParams: getUserSpaceParams
  },
  {
    path: "/user/:identifier/:type/:sort",
    component: cached(Page),
    getListingParams: getUserPageParams
  },
  {
    path: "/user/:identifier/:type",
    component: cached(Page),
    getListingParams: getUserPageParams
  },
  {
    path: "/user/:identifier",
    component: cached(Page),
    getListingParams: getUserPageParams
  },
  {
    path: "/:prefix/:identifier/:sort",
    component: cached(Page),
    getListingParams: getPageParams
  },
  {
    path: "/:prefix/:identifier",
    component: cached(Page),
    getListingParams: getPageParams
  },
  {
    path: "/:sort",
    component: cached(SpaceListingPage),
    getSpaceParams: getUserSpaceParams
  },
  {
    path: "/",
    exact: true,
    component: cached(SpaceListingPage),
    getSpaceParams: getUserSpaceParams
  }
].map(toRoute);
