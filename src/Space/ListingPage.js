import React from "react";
import { prop } from "ramda";
import { PREFIX } from "notabug-peer";
import { routes } from "notabug-peer/json-schema";
import { useMemoizedObject } from "utils";
import { Page } from "Page";
import { useSpace, SpaceProvider } from "./Provider";
import { tabulator as defaultIndexer } from "../config.json";

export const SpaceListingPage = ({ spaceParams, ...props }) => {
  const sort = prop("sort", spaceParams);
  const opId = prop("opId", spaceParams);
  const owner = prop("owner", spaceParams) || defaultIndexer;
  const name = prop("name", spaceParams) || "frontpage";

  return (
    <SpaceProvider {...{ owner, name }}>
      <SpaceListingPageContent {...{ ...props, sort, opId }} />
    </SpaceProvider>
  );
};

const SpaceListingPageContent = ({ sort: sortProp, opId, ...props }) => {
  const {
    owner,
    spaceName: name,
    indexer,
    tabulator,
    defaultTabPath
  } = useSpace();
  let sort = sortProp;
  const soul = (() => {
    if (opId) {
      if (!sort) sort = "best";
      return routes.ThingCommentsListing.reverse({
        thingId: opId,
        sort,
        indexer: tabulator
      });
    }

    if (sort || !defaultTabPath) {
      if (!sort) sort = "hot";
      return routes.SpaceListing.reverse({
        prefix: "user",
        authorId: owner,
        name,
        sort,
        indexer: tabulator
      });
    }
    return `${PREFIX}${defaultTabPath}@~${indexer}.`;
  })();
  const listingParams = useMemoizedObject({ sort, soul, indexer, tabulator });

  return <Page {...{ ...props, listingParams }} />;
};
