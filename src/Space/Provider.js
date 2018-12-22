import React, { createContext, useContext, useMemo } from "react";
import { useNotabug } from "NabContext";
import { toListingObject, spaceSourceWithDefaults } from "notabug-peer/source";
import { Loading, useQuery } from "utils";
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
            <div className="spacer">
              <Loading message="loading space" />
            </div>
          </div>
        </PageTemplate>
      )}
    </SpaceContext.Provider>
  );
});
