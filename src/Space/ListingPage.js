import React from "react";
import { prop } from "ramda";
import { useNotabug } from "NabContext";
import { PREFIX } from "notabug-peer";
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
  const { api } = useNotabug();
  const { owner, spaceName: name, indexer, tabulator, defaultTabPath } = useSpace();
  let sort = sortProp;
  const soul = (() => {
    if (opId) {
      // TODO: More specific schema types?
      if (!sort) sort = "best";
      return api.schema.typedListing.soul({
        prefix: "things",
        identifier: opId,
        type: "comments",
        sort,
        tabulatorId: tabulator
      });
    }

    if (sort || !defaultTabPath) {
      if (!sort) sort = "hot";
      return api.schema.userListing.soul({
        prefix: "user",
        identifier: owner,
        kind: "spaces",
        type: name,
        sort,
        tabulatorId: tabulator
      });
    }
    return `${PREFIX}${defaultTabPath}@~${indexer}.`;
  })();
  const listingParams = useMemoizedObject({ sort, soul, indexer, tabulator });

  return <Page {...{ ...props, listingParams }} />;
};
