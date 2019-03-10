import React from "react";
import { Config } from "notabug-peer";
import { NabProvider } from "NabContext";
import { withRouter } from "react-router-dom";
import { Routing } from "Routing";
import { VotingQueue } from "Voting";
import { ErrorBoundary } from "utils";
import { owner, tabulator, indexer } from "./config";
export { routes } from "Routing";

Config.update({ owner, tabulator, indexer });

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
