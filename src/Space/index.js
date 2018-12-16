import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useNotabug } from "NabContext";
import { prop } from "ramda";
import { PREFIX } from "notabug-peer";
import {
  parseListingSource,
  spaceSourceWithDefaults
} from "notabug-peer/listings";
import { JavaScriptRequired, useMemoizedObject, useQuery } from "utils";
import { Page, PageTemplate } from "Page";
import { tabulator as defaultIndexer } from "../config.json";

const SpaceContext = createContext();
export const useSpace = () => useContext(SpaceContext) || null;

export const Space = React.memo(({ listingParams: spaceParams, ...props }) => {
  const { api } = useNotabug();
  const sort = prop("sort", spaceParams);
  const owner = prop("owner", spaceParams) || defaultIndexer;
  const name = prop("name", spaceParams) || "frontpage";
  const { userAlias: ownerAlias } =
    useQuery(api.queries.userMeta, [`~${owner}`]) || {};
  const [{ body } = {}, hasSource] = useQuery(api.queries.wikiPage, [
    owner,
    `space:${name}`
  ]);
  const source = spaceSourceWithDefaults({ owner, name, source: body });
  const parsedSource = useMemo(() => parseListingSource(source), [source]);
  const indexer = parsedSource.getValue("indexer") || defaultIndexer;
  const tabulator = parsedSource.getValue("tabulator") || indexer;
  const defaultTab = parsedSource.getValue("tab");
  const defaultTabPath = defaultTab
    ? parsedSource.getValue(["tab", defaultTab])
    : null;

  const isIdSticky = useCallback(
    id => !!parsedSource.isPresent(["sticky", id]),
    [parsedSource]
  );

  const soul = (() => {
    if (!hasSource && !body) return null;
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

  const spaceContext = useMemoizedObject({
    owner,
    name,
    source,
    parsedSource,
    ownerAlias,
    indexer,
    tabulator,
    isIdSticky
  });

  return (
    <SpaceContext.Provider value={spaceContext}>
      {soul ? (
        <Page {...{ ...props, listingParams }} />
      ) : (
        <PageTemplate>
          <div className="content" role="main">
            <JavaScriptRequired>
              <h1>Loading Space...</h1>
            </JavaScriptRequired>
          </div>
        </PageTemplate>
      )}
    </SpaceContext.Provider>
  );
});
