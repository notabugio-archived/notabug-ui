/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect
} from "react";
import * as R from "ramda";
import ChatView from "react-chatview";
import { ChatMsg, ChatInput } from "/Chat";
import { Things } from "/Listing/Things";
import { ErrorBoundary, Loading as LoadingComponent } from "/utils";

const PAGE_SIZE = 25;
const BOTTOM_HEIGHT = 15; // offset in pixels from bottom that still counts as bottom

class AutoScrollChatView extends ChatView {
  updateScrollTop() { /* empty */ }
}

export const InfiniteContent = React.memo(
  ({
    Loading = LoadingComponent,
    Empty = () => <LoadingComponent name="ball-grid-beat" />,
    ListingContext
  }) => {
    const scrollable = useRef(null);
    const { ids: limitedIds, isChat, limit, setLimit } = useContext(
      ListingContext
    );
    const firstId = R.nth(0, limitedIds) || "";

    let lastScrollHeight = 0, lastScrollTop = 0, lastScrollBottom = 0
    const scrollToBottom = useCallback((force) => {
      if(!scrollable || !scrollable.current)
        return;
      const c = scrollable.current

      if(force) {
        lastScrollTop = c.scrollTop = c.scrollHeight - c.clientHeight
        lastScrollHeight = lastScrollBottom = c.scrollHeight
        return
      }

      const lastBottom = lastScrollHeight - BOTTOM_HEIGHT
      const sizeChanged = (c.scrollHeight - BOTTOM_HEIGHT) != lastBottom
      const anchorTop = c.scrollTop + c.clientHeight
      const wasAtBottom = lastScrollBottom >= lastBottom || lastScrollHeight <= c.clientHeight

      if(sizeChanged && wasAtBottom)
        c.scrollTop = c.scrollHeight - c.clientHeight

      lastScrollBottom = lastScrollTop + c.clientHeight
      lastScrollTop = c.scrollTop
      lastScrollHeight = c.scrollHeight
    }, [scrollable.current]);

    const loadMore = useCallback(() => {
      setLimit(R.add(PAGE_SIZE));
    }, []);

    const onLoadMore = useCallback(
      () =>
        new Promise(ok => {
          loadMore();
          setTimeout(ok, 1000);
        }),
      [loadMore]
    );

    useEffect(() => {
      if (isChat) {
        const interval = setInterval(scrollToBottom, 300);
        return () => {
          clearInterval(interval);
        }
      }
    }, [isChat]);

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
              fetchParent: true,
              disableChildren: true
            }}
            Loading={isChat ? ChatMsg : Loading}
            Container={isChat ? AutoScrollChatView : ChatView}
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
          {isChat ? <ChatInput {...{ ListingContext, scrollToBottom }} /> : null}
        </div>
      </ErrorBoundary>
    );
  }
);
