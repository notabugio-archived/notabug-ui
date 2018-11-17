import React, {
  useContext,
  useState,
  useCallback,
  useRef
} from "react";
import { add } from "ramda";
import qs from "qs";
import debounce from "lodash/debounce";
import { ZalgoPromise as Promise } from "zalgo-promise";
import ChatView from "react-chatview";
import { ChatMsg, ChatInput } from "Chat";
import { useLimitedListing } from "Listing";
import { Things } from "Listing/Things";
import { Loading as LoadingComponent } from "utils";

export const InfiniteContent = React.memo(
  ({
    location,
    Loading=LoadingComponent,
    Empty = () => <LoadingComponent name="ball-grid-beat" />,
    ListingContext
  }) => {
    const { search } = location;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const count = parseInt(query.count, 10) || 0;
    const [limit, setLimit] = useState(parseInt(query.limit, 10) || 25);
    const [preventAutoScroll, setPreventAutoScroll] = useState(false);
    const scrollable = useRef(null);
    const { ids: allIds, isChat, listingParams } = useContext(ListingContext);

    const { ids: limitedIds } = useLimitedListing({
      ids: allIds,
      location,
      limit,
      count,
      listingParams
    });

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

    return  (
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
            scrollLoadThreshold: 800,
            onInfiniteLoad: onLoadMore,
            flipped: isChat,
            returnScrollable: el => scrollable.current = el
          }}
        />
        {isChat ? <ChatInput {...{ ListingContext }} /> : null}
      </div>
    );
  }
);

