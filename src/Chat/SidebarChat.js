import React, { useMemo } from "react";
import { Link } from "utils";
import { useListingContext } from "Listing";
import { InfiniteContent } from "Page/InfiniteContent";
import { tabulator } from "../config.json";

export const SidebarChat = ({ topic }) => {
  const listingParams = useMemo(() => ({
    soul: `nab/t/${topic}/chat@~${tabulator}.`,
    limit: 10,
    indexer: tabulator
  }));
  const { ListingContext, listingData } = useListingContext({ listingParams });

  if (!topic) return null;

  return (
    <ListingContext.Provider value={listingData}>
      <div className="spacer">
        <div className="sidecontentbox sidebar-chat">
          <div className="title">
            <h1><Link href={`/t/${topic}/chat`}>{topic} chat</Link></h1>
          </div>
          <InfiniteContent
            isChat
            limit={5}
            {...{ ListingContext }}
          />
        </div>
      </div>
    </ListingContext.Provider>
  );
};
