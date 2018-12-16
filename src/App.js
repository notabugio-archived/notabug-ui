import React from "react";
import { NabProvider } from "NabContext";
import { withRouter } from "react-router-dom";
import { Routing } from "Routing";
import { VotingQueue } from "Voting";
import { ErrorBoundary } from "utils";

export { routes } from "Routing";

export const App = withRouter(React.memo(({ notabugApi, history }) => (
  <NabProvider {...{ notabugApi, history }}>
    <ErrorBoundary>
      <VotingQueue>
        <Routing />
      </VotingQueue>
    </ErrorBoundary>
  </NabProvider>
)));
