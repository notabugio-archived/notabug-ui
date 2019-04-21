/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from "react";
import qs from "query-string";
import { Link, JavaScriptRequired } from "/utils";
import { Things } from "/Listing/Things";
import { ErrorBoundary, Loading as LoadingComponent } from "/utils";

export const PagedContent = React.memo(
  ({
    location,
    Loading = LoadingComponent,
    Empty = () => <LoadingComponent name="ball-grid-beat" />,
    onToggleInfinite,
    ListingContext
  }) => {
    const { pathname, search } = location;
    const { ids: limitedIds } = useContext(ListingContext);
    const query = qs.parse(search);
    const count = parseInt(query.count, 10) || 0;
    const limit = parseInt(query.limit, 10) || 25;
    const hasPrev = count - limit >= 0;
    const hasNext = limitedIds.length >= limit;

    return (
      <ErrorBoundary>
        <a name="content" key="anchor" />
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
