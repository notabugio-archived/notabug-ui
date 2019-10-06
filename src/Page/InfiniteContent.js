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
    }, [limitedIds])

    const forceToBottom = useRef(true)
    const scrollToBottom = () => {
      forceToBottom.current = true
    }

    const clipper = useRef(createRef())

    let animFrame = null
    useEffect(() => {
      if (!isChat) return

      let scrollHeight = 0, scrollTop = 0, scrollBottom = 0
      const keepAtBottom = () => {
        animFrame = requestAnimationFrame(keepAtBottom)
        if(!scrollable.current || !clipper.current)
          return

        const c = scrollable.current
        const lastBottom = scrollHeight - BOTTOM_HEIGHT
        const wasAtBottom = scrollBottom >= lastBottom || scrollHeight <= c.clientHeight

        if(forceToBottom.current || (hasNewItems.current && wasAtBottom))
          c.scrollTop = c.scrollHeight - c.clientHeight

        if(forceToBottom.current)
          setTimeout(() => {
            forceToBottom.current = !wasAtBottom
          }, 1000)

        scrollTop = c.scrollTop
        scrollBottom = scrollTop + c.clientHeight
        scrollHeight = c.scrollHeight
        hasNewItems.current = false

        const clipSize = Math.min(BOTTOM_HEIGHT * 2, (scrollHeight - (scrollTop + c.clientHeight)) * .1)
        if(clipSize != clipper.current.clientHeight)
          clipper.current.style.height = clipSize + "px"
      }

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
          {isChat ?<>
            <div className="chat-scrollbtn-clipper" ref={clipper}>
              <button
                className="chat-scrollbtn"
                onClick={scrollToBottom}
              >
                ↓↓↓
              </button>
            </div>
            <ChatInput {...{ ListingContext, scrollToBottom, scrollable }} />
          </>: null}
        </div>
      </ErrorBoundary>
    );
  }
);
