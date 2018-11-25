import React, { useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Link } from "utils";
import { useListingContext } from "Listing";
import { InfiniteContent } from "Page/InfiniteContent";
import { tabulator } from "../config.json";

export const SidebarChat = withRouter(({ location, topic }) => {
  const listingParams = useMemo(() => ({
    soul: `nab/t/${topic}/chat@~${tabulator}.`,
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
            location={location}
            {...{ ListingContext }}
          />
        </div>
      </div>
    </ListingContext.Provider>
  );
});
