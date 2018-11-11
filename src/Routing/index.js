import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
//import { Helmet } from "react-helmet";
import { ScrollToTop } from "utils";
import { Chat } from "Chat";
import { routes } from "./routes";
export { routes } from "./routes";

export const Routing = () => (
  <React.Fragment>
    {/*<Helmet>
      <title>notabug: the back page of the internet</title>
      <body class="loggedin subscriber" />
    </Helmet>*/}
    <ScrollToTop>
      <Switch>
        {routes.map(route => (
          <Route {...route} key={route.path} />
        ))}
      </Switch>
    </ScrollToTop>
    <Switch>
      <Redirect from="/user/~:user(.+)" to="/user/:user" />
      <Route path="*/chat" component={() => null} />
      <Route path="*/firehose" component={() => null} />
      <Route path="/*" component={Chat} />
    </Switch>
  </React.Fragment>
);
