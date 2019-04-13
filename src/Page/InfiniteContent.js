/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useCallback, useRef } from "react";
import { add } from "ramda";
import ChatView from "react-chatview";
import { ChatMsg, ChatInput } from "Chat";
import { useLimitedListing } from "Listing";
import { Things } from "Listing/Things";
import { ErrorBoundary, Loading as LoadingComponent } from "utils";

const PAGE_SIZE = 25;

export const InfiniteContent = React.memo(
  ({
    Loading = LoadingComponent,
    Empty = () => <LoadingComponent name="ball-grid-beat" />,
    ListingContext
  }) => {
    const [lastScrollTime, setLastScrollTime] = useState(0);
    const scrollable = useRef(null);
    const { ids: limitedIds, idsQuery, isChat, limit, count, setLimit } = useContext(ListingContext);

    const scrollToBottom = useCallback(() => {
      setTimeout(() => {
        const now = new Date().getTime();

        if (now - lastScrollTime > 5000 && scrollable && scrollable.current)
          scrollable.current.scrollTop = scrollable.current.scrollHeight;
      }, 100);
    }, [scrollable.current, lastScrollTime]);

    const loadMore = useCallback(() => {
      setLimit(add(PAGE_SIZE));
      setLastScrollTime(new Date().getTime());
    }, []);

    const onLoadMore = useCallback(() => Promise.resolve(loadMore()), [
      isChat,
      loadMore
    ]);

    return (
      <ErrorBoundary>
        <a name="content" key="anchor" />
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
            collapseLarge={!!isChat}
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
