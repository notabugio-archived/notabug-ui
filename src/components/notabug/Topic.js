import React, { Fragment } from "react";
import { always } from "ramda";
import { Listing } from "./Listing";
import pure from "components/pure";
import { notabugListing } from "state/notabug";
import { injectState } from "freactal";
import { withRouter, Link } from "react-router-dom";
import { DEF_THRESHOLD } from "state/notabug/listing";
import qs from "qs";

const TopicBase = notabugListing(({ children }) => (
  <Fragment>{children}</Fragment>
));

const Empty = () => <h1>Loading Listing...</h1>;

export const TopicIndex = injectState(({
  match: { params: { sort } },
  location: { search, pathname },
  state: { notabugListing }
}) => {
  const query = qs.parse(search.slice(1));
  const limit = parseInt(query.limit, 10) || 25;
  const count = parseInt(query.count, 10) || 0;

  return (
    <div className="content" role="main">
      <div className="sitetable" id="siteTable">
        <Listing
          Empty={Empty}
          listing={notabugListing}
          sort={sort || "hot"}
          limit={limit}
          count={count}
          threshold={DEF_THRESHOLD}
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

export const Topic = withRouter(injectState(pure(({
  state: { notabugApi },
  topic,
  domain,
  children
}) => (
  <TopicBase
    key={topic + "/" + domain}
    getChains={domain
      ? always([notabugApi.getSubmissionsByDomain(domain)])
      : () => notabugApi.getRecentSubmissions(topic)
    }
    children={children}
  />
))));
