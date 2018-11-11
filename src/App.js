import React from "react";
import { NabContext, useNabGlobals } from "NabContext";
import { withRouter } from "react-router-dom";
import { Routing } from "Routing";
import { VotingQueue } from "Voting";

export { routes } from "Routing";

export const App = withRouter(({ notabugApi, history }) => (
  <NabContext.Provider value={useNabGlobals({ notabugApi, history })}>
    <VotingQueue>
      <Routing />
    </VotingQueue>
  </NabContext.Provider>
));
