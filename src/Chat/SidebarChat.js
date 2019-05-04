import React, { useMemo } from "react";
import { Page, Constants } from "@notabug/peer";
import { Link, Markdown } from "/utils";
import { useListingContext } from "/Listing";
import { InfiniteContent } from "/Page/InfiniteContent";

const ChatLoading = () => (
  <div className="thing comment">
    <div className="entry unvoted">
      <form className="usertext">
        <Markdown body="Nobody has said anything yet, be the first" />
      </form>
    </div>
    <div className="clearleft" />
  </div>
);

export const SidebarChat = ({ topic }) => {
  const queries = useMemo(() => Page.withListingMatch(`/t/${topic}/chat`), [
    topic
  ]);
  const { ids: idsQuery, space: specQuery } = queries;
  const { ListingContext, listingData } = useListingContext({
    idsQuery,
    specQuery,
    count: 0,
    limit: Constants.CHAT_PRELOAD_ITEMS
  });

  if (!topic) return null;
  return (
    <ListingContext.Provider value={listingData}>
      <div className="spacer">
        <div className="sidecontentbox sidebar-chat">
          <div className="title">
            <h1>
              <Link href={`/t/${topic}/chat`}>{topic} chat</Link>
            </h1>
          </div>
          <InfiniteContent
            Empty={ChatLoading}
            isChat
            limit={Constants.CHAT_PRELOAD_ITEMS}
            {...{ ListingContext }}
          />
        </div>
      </div>
    </ListingContext.Provider>
  );
};
