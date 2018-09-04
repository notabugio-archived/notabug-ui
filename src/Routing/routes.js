import { ContentPolicy, PrivacyPolicy, UserAgreement, KnownPeers, Reddit } from "static";
import { cached } from "utils";
import { Topic } from "Listing";
import { SubmissionDetail } from "Submission/Detail";
import { SubmissionForm } from "Submission/Form";
import { toRoute } from "./toRoute";

const baseParams = ({ params: { sort="hot" }, query: { count, limit } }) => ({
  sort,
  count: parseInt(count, 10) || 0,
  limit: parseInt(limit, 10) || 25,
  days: parseInt(limit, 10) || 90,
});

const withParams = fn => (props) => ({ ...baseParams(props), ...fn(props) });

const getTopicListingParams = withParams(({ params: { topic="all" } }) => ({
  space: {
    good: [{
      topics: topic.split("+")
    }]
  }
}));

const getDomainListingParams = withParams(({ params: { domain } }) => ({
  space: {
    good: [{
      domains: domain.split("+")
    }]
  }
}));

const getSubmissionListingParams = withParams((
  { params: { submission_id  }, query: { sort="best" } }
) => ({
  space: {
    good: [{
      submissionIds: [submission_id]
    }]
  },
  days: null,
  limit: null,
  sort
}));

const getFirehoseListingParams = withParams(() => ({
  space: {
    good: [{
      topics: ["chat:whatever", "comments:all", "all"],
    }]
  },
  sort: "new",
  days: 3
}));

const getProfileListingParams = withParams((
  { params: { userid, type=null }, query: { sort="new" } }
) =>({
  space: {
    good: [{
      authorIds: userid.split("+"),
      type,
    }]
  },
  type,
  sort
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
    path: "/message/comments",
    component: Topic,
    getListingParams: withParams(({ userId }) => ({
      space: {
        good: [{
          repliesToAuthorId: userId ? `~${userId}` : undefined,
          type: "comments"
        }]
      },
      days: null,
      sort: "new"
    }))
  }, {
    path: "/message/selfreply",
    component: Topic,
    getListingParams: withParams(({ userId }) => ({
      space: {
        good: [{
          repliesToAuthorId: userId ? `~${userId}` : undefined,
          type: "submitted"
        }]
      },
      days: null,
      sort: "new"
    }))
  }, {
    path: "/message/inbox",
    component: Topic,
    getListingParams: withParams(({ userId }) => ({
      space: {
        good: [{
          repliesToAuthorId: userId ? `~${userId}` : undefined
        }]
      },
      days: null,
      sort: "new"
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
    path: "/user/:userid/overview/:sort",
    component: cached(Topic),
    getListingParams: getProfileListingParams
  }, {
    path: "/user/:userid/overview",
    component: cached(Topic),
    getListingParams: getProfileListingParams
  }, {
    path: "/user/:userid/:type/:sort",
    component: cached(Topic),
    getListingParams: getProfileListingParams
  }, {
    path: "/user/:userid/:type",
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
].map(toRoute);
