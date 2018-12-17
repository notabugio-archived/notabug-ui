import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useNotabug } from "NabContext";
import {
  parseListingSource,
  spaceSourceWithDefaults
} from "notabug-peer/listings";
import { JavaScriptRequired, useMemoizedObject, useQuery } from "utils";
import { PageTemplate } from "Page";
import { tabulator as defaultIndexer } from "../config.json";

const SpaceContext = createContext();
export const useSpace = () => useContext(SpaceContext) || null;

export const SpaceProvider = React.memo(({ owner, name, children }) => {
  const { api } = useNotabug();
  const { userAlias: ownerAlias } =
    useQuery(api.queries.userMeta, [`~${owner}`]) || {};
  const [{ body } = {}, isLoaded] = useQuery(api.queries.wikiPage, [
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
  const displayName = parsedSource.getValue("name") || name;

  const isIdSticky = useCallback(
    id => !!parsedSource.isPresent(["sticky", id]),
    [parsedSource]
  );

  const useForComments = !parsedSource.isPresent("comments leave space");
  const path = `/user/${owner}/spaces/${name}`;

  const spaceContext = useMemoizedObject({
    owner,
    name,
    displayName,
    path,
    source,
    parsedSource,
    ownerAlias,
    defaultTabPath,
    indexer,
    tabulator,
    useForComments,
    isIdSticky
  });

  return (
    <SpaceContext.Provider value={spaceContext}>
      {isLoaded ? children : (
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
