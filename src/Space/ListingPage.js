import React from "react";
import { prop } from "ramda";
import { useNotabug } from "NabContext";
import { PREFIX } from "notabug-peer";
import { useMemoizedObject } from "utils";
import { Page } from "Page";
import { useSpace, SpaceProvider } from "./Provider";
import { tabulator as defaultIndexer } from "../config.json";

export const SpaceListingPage = ({
  listingParams: spaceParams, ...props
}) => {
  const sort = prop("sort", spaceParams);
  const owner = prop("owner", spaceParams) || defaultIndexer;
  const name = prop("name", spaceParams) || "frontpage";

  return (
    <SpaceProvider {...{ owner, name }}>
      <SpaceListingPageContent {...{ ...props, sort }} />
    </SpaceProvider>
  );
};

const SpaceListingPageContent = ({
  sort,
  ...props
}) => {
  const { api } = useNotabug();
  const { owner, name, indexer, tabulator, defaultTabPath } = useSpace();
  const soul = (() => {
    if (sort || !defaultTabPath) {
      return api.schema.userListing.soul({
        prefix: "user",
        identifier: owner,
        kind: "spaces",
        type: name,
        sort: sort || "hot",
        tabulatorId: tabulator
      });
    }
    return `${PREFIX}${defaultTabPath}@~${indexer}.`;
  })();
  const listingParams = useMemoizedObject({ soul, indexer, tabulator });

  return <Page {...{ ...props, listingParams }} />;
};

