import React, { createContext, useContext, useMemo } from "react";
import { useNotabug } from "NabContext";
import { spaceSourceWithDefaults } from "notabug-peer/listings";
import { toListingObject } from "notabug-peer/source";
import { JavaScriptRequired, useQuery } from "utils";
import { PageTemplate } from "Page";

const SpaceContext = createContext();
export const useSpace = () => useContext(SpaceContext) || null;

export const SpaceProvider = React.memo(({ owner, name, children }) => {
  const { api } = useNotabug();
  const [{ body } = {}, isLoaded] = useQuery(api.queries.wikiPage, [
    owner,
    `space:${name}`
  ]);
  const source = spaceSourceWithDefaults({ owner, name, source: body });
  const spaceContext = useMemo(() => toListingObject(source, owner, name), [source, owner, name]);

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
