import Route from "route-parser";
import { query } from "./scope";
import { thingScores } from "./queries";
import * as SOULS from "./souls";
import { listingThingIds } from "./listings";

const baseParams = ({ params: { tab1, tab2, sort="hot" }={}, query: { count, limit }={} }={}) => ({
  sort,
  tabulator: `~${tab1}.${tab2}`,
  count: parseInt(count, 10) || 0,
  limit: parseInt(limit, 10) || 1000,
  days: parseInt(limit, 10) || 180,
});

const listingQuery = fn => query((scope, params) => listingThingIds(
  scope, { ...baseParams({ params }), ...fn({ params }) }
).then(ids => ({ ids: ids.join("+") })));

const routes = [
  {
    path: "nab/things/:thingid/votecounts@~:tab1.:tab2.",
    query: query((scope, params) => thingScores(scope, SOULS.thing.soul(params))),
    observeAccessed: true,
  },
  {
    path: "nab/things/:submission_id/comments/:sort@~:tab1.:tab2.",
    query: listingQuery((
      { params: { submission_id, sort="best" } }
    ) => ({
      space: { good: [{ submissionIds: submission_id.split("+") }] },
      days: null,
      limit: null,
      sort,
    })),
    observeAccessed: true,
  }, {
    path: "nab/t/:topic/:sort@~:tab1.:tab2.",
    query: listingQuery(({ params: { topic="all" } }) => ({
      space: { good: [{ topics: topic.split("+") }] },
    })),
    observeAccessed: true,
  }, {
    path: "nab/user/:userid/replies/:type/:sort@~:tab1.:tab2.",
    query: listingQuery(({ params: { userid, type="all", sort="new" } }) => ({
      space: { good: [{ repliesToAuthorId: userid ? `~${userid}` : undefined }] },
      type: type === "all" ? null : type,
      sort,
    })),
    observeAccessed: true,
  }, {
    path: "nab/user/:userid/:type/:sort@~:tab1.:tab2.",
    query: listingQuery(({ params: { userid, type="overview", sort="new" } }) => ({
      space: {
        good: [{ authorIds: userid.split("+").map(id => `~${id}`), type }],
      },
      type,
      sort,
    })),
    observeAccessed: true,
  }, {
    path: "nab/domain/:domain/:sort@~:tab1.:tab2.",
    query: listingQuery(({ params: { domain } }) => ({
      space: { good: [{ domains: domain.split("+") }] },
    })),
    observeAccessed: true,
  },
].map(({ path, ...rest }) => ({
  matcher: new Route(path),
  path,
  ...rest,
}));

export const getComputeRoute = peer => soul => {
  let match = null;
  const route = routes.find(rt => (match = rt.matcher.match(soul)));
  return route ? { ...route, match, query: scope => route.query(scope, match) } : null
};
