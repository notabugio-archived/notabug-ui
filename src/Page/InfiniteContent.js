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

    const hasNewItems = useRef(false)
    useEffect(() => {
      hasNewItems.current = true
    }, [limitedIds])

    const forceToBottom = useRef(true)
    const scrollToBottom = () => {
      forceToBottom.current = true
    }

    let lastScrollHeight = 0, lastScrollTop = 0, lastScrollBottom = 0
    let animFrame = null
    const keepAtBottom = () => {
      animFrame = requestAnimationFrame(keepAtBottom)
      if(!scrollable || !scrollable.current)
        return
      const c = scrollable.current
      const lastBottom = lastScrollHeight - BOTTOM_HEIGHT
      const wasAtBottom = lastScrollBottom >= lastBottom || lastScrollHeight <= c.clientHeight

      if(forceToBottom.current || (hasNewItems.current && wasAtBottom))
        c.scrollTop = c.scrollHeight - c.clientHeight

      lastScrollTop = c.scrollTop
      lastScrollBottom = lastScrollTop + c.clientHeight
      lastScrollHeight = c.scrollHeight
      forceToBottom.current = false
      hasNewItems.current = false
    }

    useEffect(() => {
      if (!isChat) return
      animFrame = requestAnimationFrame(keepAtBottom)
      return () => cancelAnimationFrame(animFrame)
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
          {isChat ? <ChatInput {...{ ListingContext, scrollToBottom, scrollable }} /> : null}
        </div>
      </ErrorBoundary>
    );
  }
);
