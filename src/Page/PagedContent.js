import React, { useContext } from "react";
import qs from "qs";
import { Link, JavaScriptRequired } from "utils";
import { useLimitedListing } from "Listing";
import { Things } from "Listing/Things";
import { ErrorBoundary, Loading as LoadingComponent } from "utils";

export const PagedContent = React.memo(
  ({
    location,
    Loading=LoadingComponent,
    Empty = () => <LoadingComponent name="ball-grid-beat" />,
    onToggleInfinite,
    ListingContext
  }) => {
    const { pathname, search } = location;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const count = parseInt(query.count, 10) || 0;
    const limit = parseInt(query.limit, 10) || 25;
    const { ids: allIds } = useContext(ListingContext);
    const { ids: limitedIds } = useLimitedListing({
      ids: allIds,
      limit,
      count
    });
    const hasPrev = count - limit >= 0;
    const hasNext = limitedIds.length >= limit;

    return (
      <ErrorBoundary>
        <div className="content" role="main">
          <div className="sitetable" id="siteTable">
            <Things
              {...{ Loading, Empty, ListingContext, limit }}
              ids={limitedIds}
              fetchParent
              disableChildren
            >
              {hasPrev || hasNext ? (
                <div className="nav-buttons" key="navigation">
                  <span className="nextprev">
                    {"view more: "}
                    {hasPrev ? (
                      <Link
                        href={`${pathname || "/"}?${qs.stringify({
                          ...query,
                          count: count - limit
                        })}`}
                      >
                        ‹ prev
                      </Link>
                    ) : null}
                    <JavaScriptRequired silent>
                      <a onClick={onToggleInfinite} href="">
                        ∞
                      </a>
                    </JavaScriptRequired>
                    <Link
                      href={`${pathname || "/"}?${qs.stringify({
                        ...query,
                        count: count + limit
                      })}`}
                    >
                      next ›
                    </Link>
                  </span>
                </div>
              ) : null}
            </Things>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
);

