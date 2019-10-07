/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  createRef,
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
      // TODO: grab last item
    }, [limitedIds])

    const forceToBottom = useRef(true)
    const scrollToBottom = () => {
      forceToBottom.current = true
      if(!scrollable.current)
        return
      const c = scrollable.current
      c.scrollTop = c.scrollHeight - c.clientHeight
    }

    const scrollButton = useRef(createRef())
    let animFrame = null
    useEffect(() => {
      if (!isChat) return

      let scrollTop = 0, scrollBottom = 0, scrollHeight = 0
      const keepAtBottom = () => {
        animFrame = requestAnimationFrame(keepAtBottom)
        if(!scrollable.current || !scrollButton.current)
          return

        const c = scrollable.current
        const lastBottom = scrollHeight - BOTTOM_HEIGHT
        const wasAtBottom = scrollBottom >= lastBottom || scrollHeight <= c.clientHeight

        if(forceToBottom.current || (hasNewItems.current && wasAtBottom))
          c.scrollTop = c.scrollHeight - c.clientHeight

        const isAtBottom = c.scrollTop >= c.scrollHeight - (c.clientHeight + BOTTOM_HEIGHT)
        if(isAtBottom != wasAtBottom)
          scrollButton.current.style.display = isAtBottom ? "none" : "block"

        scrollTop = c.scrollTop
        scrollHeight = c.scrollHeight
        scrollBottom = scrollTop + c.clientHeight
        hasNewItems.current = false
        forceToBottom.current = false // TODO: reset only if last listing item is fully populated
      }

      animFrame = requestAnimationFrame(keepAtBottom)
      return () => cancelAnimationFrame(animFrame)
    }, [isChat]);

    return (
      <ErrorBoundary>
        <a name="content" key="anchor" />
        <div className="content" role="main">
          <div className="things-container">
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
            {isChat ?
              <div className="chat-scrollbtn" onClick={scrollToBottom} ref={scrollButton}>
                ↧
              </div>
            : null}
          </div>
          {isChat ?
            <ChatInput {...{ ListingContext, scrollToBottom, scrollable }} />
          : null}
        </div>
      </ErrorBoundary>
    );
  }
);
