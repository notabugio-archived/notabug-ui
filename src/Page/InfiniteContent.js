import React, { useContext, useState, useCallback, useRef } from "react";
import { add } from "ramda";
import debounce from "lodash/debounce";
import { ZalgoPromise as Promise } from "zalgo-promise";
import ChatView from "react-chatview";
import { ChatMsg, ChatInput } from "Chat";
import { useLimitedListing } from "Listing";
import { Things } from "Listing/Things";
import { ErrorBoundary, Loading as LoadingComponent } from "utils";

export const InfiniteContent = React.memo(
  ({
    Loading = LoadingComponent,
    Empty = () => <LoadingComponent name="ball-grid-beat" />,
    limit: limitProp = 25,
    count = 0,
    ListingContext
  }) => {
    const [limit, setLimit] = useState(limitProp);
    const [preventAutoScroll, setPreventAutoScroll] = useState(false);
    const scrollable = useRef(null);
    const { ids: allIds, isChat } = useContext(ListingContext);

    const { fetchNextPage, ids: limitedIds } = useLimitedListing({
      ids: allIds,
      limit,
      count
    });

    const scrollToBottom = useCallback(
      () => {
        setTimeout(() => {
          if (scrollable && scrollable.current && !preventAutoScroll)
            scrollable.current.scrollTop = scrollable.current.scrollHeight;
        }, 100);
      },
      [scrollable.current, preventAutoScroll]
    );

    const stoppedScrolling = useCallback(
      debounce(() => setPreventAutoScroll(false), 5000),
      []
    );

    const loadMore = useCallback(
      () => {
        setPreventAutoScroll(true);
        setLimit(add(limitProp));
        stoppedScrolling();
      },
      [limitProp]
    );

    const onLoadMore = useCallback(
      () => {
        if (isChat) return fetchNextPage(limitProp).then(loadMore).then(() => new Promise((resolve) => {
          setTimeout(resolve, 50);
        }));
        return Promise.resolve(loadMore());
      },
      [isChat, loadMore, fetchNextPage]
    );

    return (
      <ErrorBoundary>
        <div className="content" role="main">
          <Things
            {...{
              Empty,
              ListingContext,
              limit,
              ids: limitedIds,
              onDidUpdate: isChat ? scrollToBottom : null,
              fetchParent: true,
              disableChildren: true
            }}
            Loading={isChat ? ChatMsg : Loading}
            Container={ChatView}
            collapseLarge={isChat ? true : false}
            containerProps={{
              id: "siteTable",
              className: `sitetable infinite-listing ${
                isChat ? "chat-listing" : ""
              }`,
              scrollLoadThreshold: 1000,
              onInfiniteLoad: onLoadMore,
              flipped: isChat,
              returnScrollable: el => (scrollable.current = el)
            }}
          />
          {isChat ? <ChatInput {...{ ListingContext }} /> : null}
        </div>
      </ErrorBoundary>
    );
  }
);
