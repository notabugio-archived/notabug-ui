import React from "react";
import { Listing } from "./Listing";
import { withRouter, Link } from "react-router-dom";
import { Loading } from "./Loading";
import qs from "qs";

const Empty = () => <Loading name="ball-grid-beat" />;

const DEF_THRESHOLD = (window && window.location && window.location.search)
  ? parseInt(qs.parse(window.location.search).threshold, 10) || 1 : 1;

export const Topic = withRouter(({
  match: { params: { sort, topic="all", domain } },
  location: { search, pathname },
}) => {
  const query = qs.parse(search.slice(1));
  const limit = parseInt(query.limit, 10) || 25;
  const count = parseInt(query.count, 10) || 0;

  return (
    <div className="content" role="main">
      <div className="sitetable" id="siteTable">
        <Listing
          Empty={Empty}
          key={`${topic}/${domain}/${sort}`}
          sort={sort || "hot"}
          topics={[topic.toLowerCase()]}
          days={(sort === "top" || sort === "comments") ? 30 : (topic === "all" || sort === "new") ? 5 : 30}
          threshold={(sort === "new" || sort === "controversial") ? null : DEF_THRESHOLD}
          domain={domain}
          limit={limit}
          count={count}
        />
        <div className="nav-buttons">
          <span className="nextprev">
            {"view more: "}
            {(count - limit) >= 0 ? (
              <Link
                to={`${pathname || "/"}?${qs.stringify({ ...query, count: count - limit })}`}
              >‹ prev</Link>
            ) : null}
            <Link
              to={`${pathname || "/"}?${qs.stringify({ ...query, count: count + limit })}`}
            >next ›</Link>
          </span>
        </div>
      </div>
    </div>
  );
});
