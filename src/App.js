import React, { useEffect } from "react"
import Helmet from "react-helmet"
import { Config } from "@notabug/peer"
import qs from "query-string"
import { NabContext, useNabGlobals } from "/NabContext"
import { withRouter } from "react-router-dom"
import { Routing } from "/Routing"
import { PageTemplate } from "/Page/Template"
import { VotingQueue } from "/Voting"
import { UiStateProvider } from "/UI"
import { ErrorBoundary } from "/utils"
import { owner, tabulator, indexer } from "./config"
export { routes } from "/Routing"

Config.update({ owner, tabulator, indexer })

export const NabProvider = withRouter(
  ({ location: { pathname, search }, history, notabugApi, children }) => {
    const value = useNabGlobals({ notabugApi, history })
    const query = qs.parse(search)

    useEffect(() => {
      if (query.indexer) {
        console.log("update indexer", query.indexer)
        Config.update({ indexer: query.indexer, tabulator: query.indexer })
      }
    }, [query.indexer])

    if (value.isLoggingIn) {
      return (
        <PageTemplate>
          <h1>Logging In...</h1>
        </PageTemplate>
      )
    }

    return <NabContext.Provider value={value}>{children}</NabContext.Provider>
  }
)

export const App = withRouter(
  React.memo(({ notabugApi, history }) => (
    <NabProvider {...{ notabugApi, history }}>
      <Helmet>
        <title>notabug: the back page of the internet</title>
        <body className="loggedin subscriber" />
      </Helmet>
      <ErrorBoundary>
        <UiStateProvider>
          <VotingQueue>
            <Routing />
          </VotingQueue>
        </UiStateProvider>
      </ErrorBoundary>
    </NabProvider>
  ))
)
