import React, { useContext, useState, useEffect } from "react";
import qs from "qs";
import { Link, JavaScriptRequired } from "utils";
import { PageFooter } from "Page/Footer";
import { useLimitedListing } from "Listing";
import { Things } from "Listing/Things";

export const PagedContent = React.memo(
  ({
    location,
    Loading,
    Empty = () => <Loading name="ball-grid-beat" />,
    onToggleInfinite,
    ListingContext
  }) => {
    const { pathname, search } = location;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const count = parseInt(query.count, 10) || 0;
    const [limit, setLimit] = useState(parseInt(query.limit, 10) || 25);

    const { ids: allIds, listingParams } = useContext(ListingContext);

    const { ids: limitedIds } = useLimitedListing({
      ids: allIds,
      location,
      limit,
      count,
      listingParams
    });

    const hasPrev = count - limit >= 0;
    const hasNext = limitedIds.length >= limit;

    useEffect(
      () => {
        setLimit(parseInt(query.limit, 10) || 25);
      },
      [query.limit]
    );

    const listing = {
      Loading,
      Empty,
      ListingContext,
      limit,
      ids: limitedIds,
      fetchParent: true,
      disableChildren: true
    };

    return (
      <React.Fragment>
        <div className="content" role="main">
          <div className="sitetable" id="siteTable">
            <Things {...listing}>
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
        <PageFooter />
        <p className="bottommenu debuginfo" key="debuginfo">
          <span className="icon">π</span>
          <span className="content" />
        </p>
      </React.Fragment>
    );
  }
);

