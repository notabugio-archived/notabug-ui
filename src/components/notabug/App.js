import React from "react";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";
import { Subreddit } from "snew-classic-ui";
import { NavTab } from "./NavTab";
import { Provider } from "./Provider";
import { SidebarTitlebox } from "./SidebarTitlebox";
import { UserInfo } from "./UserInfo";
import { Chat, ChatPage } from "./Chat";
import { FooterParent } from "./FooterParent";
import { Notifications } from "./Notifications";
import { LoginSignupPage, LoginFormSide } from "./LoginSignupPage";
import { Link } from "./Link";
import { router } from "state";
import ScrollToTop from "./ScrollToTop";
import { injectState } from "freactal";
import { cached } from "./Cached";

import { routes } from "./routes";

const TopicRoute = injectState(({
  state: { notabugUser },
  match: { params: { topic } },
}) => (
  <Subreddit
    Link={Link}
    SidebarTitlebox={SidebarTitlebox}
    FooterParent={() => null}
    SidebarSearch={() => null}
    LoginFormSide={LoginFormSide}
    RecentlyViewedLinks={() => null}
    AccountActivityBox={() => null}
    Timestamp={() => null}
    SrHeaderArea={() => null}
    UserInfo={UserInfo}
    NavTab={NavTab}
    username={notabugUser}
    subreddit={topic || ""}
    siteprefix="t"
    isShowingCustomStyleOption={false}
  >
    <Switch>
      {routes.map(route => <Route {...route} key={route.path} />)}
    </Switch>
  </Subreddit>
));

export const App = router(({ notabugApi }) => (
  <Provider notabugApi={notabugApi}>
    <Helmet>
      <title>notabug: the back page of the internet</title>
    </Helmet>
    <ScrollToTop>
      <Switch>
        <Route path="/t/:topic/chat" component={cached(ChatPage)} />
        <Route path="/t/:topic/comments/*/*" component={TopicRoute} />
        <Route path="/t/:topic/:sort/" component={TopicRoute} />
        <Route path="/t/:topic/*" component={TopicRoute} />
        <Route path="/t/:topic" component={TopicRoute} />
        <Route path="/domain/:domain/:sort" component={TopicRoute} />
        <Route path="/login" component={LoginSignupPage} />
        <Route path="/chat" component={cached(ChatPage)} />
        <Route path="/:sort" component={TopicRoute} />
        <Route path="/*" component={TopicRoute} />
      </Switch>
    </ScrollToTop>
    <Switch>
      <Route path="/t/:topic/chat" component={() => null} />
      <Route path="/chat" component={() => null} />
      <Route path="/*" component={Chat} />
    </Switch>
    <FooterParent />
    <Notifications />
  </Provider>
));
