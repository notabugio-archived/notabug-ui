import React from "react";
import { Config } from "notabug-peer";
import { NabContext, useNabGlobals } from "NabContext";
import { withRouter } from "react-router-dom";
import { Routing } from "Routing";
import { PageTemplate } from "Page/Template";
import { VotingQueue } from "Voting";
import { ErrorBoundary } from "utils";
import { owner, tabulator, indexer } from "./config";
export { routes } from "Routing";

Config.update({ owner, tabulator, indexer });

export const NabProvider = withRouter(({ history, notabugApi, children }) => {
  const value = useNabGlobals({ notabugApi, history });

  if (value.isLoggingIn) {
    return (
      <PageTemplate>
        <h1>Logging In...</h1>
      </PageTemplate>
    );
  }
  return <NabContext.Provider value={value}>{children}</NabContext.Provider>;
});

export const App = withRouter(
  React.memo(({ notabugApi, history }) => (
    <NabProvider {...{ notabugApi, history }}>
      <ErrorBoundary>
        <VotingQueue>
          <Routing />
        </VotingQueue>
      </ErrorBoundary>
    </NabProvider>
  ))
);
