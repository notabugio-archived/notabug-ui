import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef
} from "react";
import { add } from "ramda";
import qs from "qs";
import debounce from "lodash/debounce";
import { ZalgoPromise as Promise } from "zalgo-promise";
import ChatView from "react-chatview";
import { Link, JavaScriptRequired } from "utils";
import { ChatMsg, ChatInput } from "Chat";
import { PageFooter } from "Page/Footer";
import { Submission } from "Submission";
import { useLimitedListing } from "Listing";
import { Things } from "Listing/Things";

export const Content = React.memo(
  ({
    location,
    Loading = Submission,
    Empty = () => <Loading name="ball-grid-beat" />,
    ListingContext
  }) => {
    const { pathname, search } = location;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const count = parseInt(query.count, 10) || 0;
    const [infinite, setInfinite] = useState(false);
    const [limit, setLimit] = useState(parseInt(query.limit, 10) || 25);
    const [preventAutoScroll, setPreventAutoScroll] = useState(false);
    const scrollable = useRef(null);

    const {
      ids: allIds,
      isChat,
      submitTopic,
      listingParams, addSpeculativeId,
      speculativeIds
    } = useContext(ListingContext);

    const { ids: limitedIds } = useLimitedListing({
      ids: allIds,
      location,
      limit,
      count,
      listingParams
    });

    const hasPrev = count - limit >= 0;
    const hasNext = limitedIds.length >= limit;

    const scrollToBottom = useCallback(
      () => {
        setTimeout(
          () => {
            if (scrollable && scrollable.current && !preventAutoScroll)
              scrollable.current.scrollTop = scrollable.current.scrollHeight;
          },
          10
        );
      },
      [scrollable.current, preventAutoScroll]
    );

    const stoppedScrolling = useCallback(
      debounce(() => setPreventAutoScroll(false), 5000),
      []
    );

    const onLoadMore = useCallback(() => {
      setPreventAutoScroll(true);
      setLimit(add(25));
      stoppedScrolling();
      return Promise.resolve();
    }, []);

    const onToggleInfinite = useCallback(evt => {
      evt && evt.preventDefault();
      setInfinite(cur => !cur);
    }, []);

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
      realtime: !!(infinite || isChat),
      ids: limitedIds,
      listingParams,
      speculativeIds,
      addSpeculativeId,
      onDidUpdate: isChat ? scrollToBottom : null,
      fetchParent: true,
      disableChildren: true
    };

    if (isChat) listing.Loading = ChatMsg;

    return infinite || isChat ? (
      <React.Fragment>
        <div className="content" role="main">
          <Things
            {...listing}
            Container={ChatView}
            collapseLarge={isChat ? true : false}
            containerProps={{
              id: "siteTable",
              className: `sitetable infinite-listing ${
                isChat ? "chat-listing" : ""
              }`,
              scrollLoadThreshold: 800,
              onInfiniteLoad: onLoadMore,
              flipped: isChat,
              returnScrollable: el => scrollable.current = el
            }}
          />
          {isChat ? (
            <ChatInput
              {...{ addSpeculativeId }}
              topic={submitTopic || "whatever"}
            />
          ) : null}
        </div>
      </React.Fragment>
    ) : (
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
