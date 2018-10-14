import React from "react";
import { injectState } from "freactal";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";
import { Profile } from "Profile";
import { Subreddit } from "snew-classic-ui";
import { Link, ScrollToTop, cached } from "utils";
import { UserInfo, LoginSignupPage, LoginFormSide } from "Auth";
import { Chat, ChatPage } from "Chat";
import { Routing, routes } from "Routing";
import { Voting } from "Voting";
import { NavTab } from "./NavTab";
import { SidebarTitlebox } from "./SidebarTitlebox";
import { FooterParent } from "./FooterParent";

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
    <Switch>{routes.map(route => <Route {...route} key={route.path} />)}</Switch>
  </Subreddit>
));

const PageRoute = () => (
  <Switch>{routes.map(route => <Route {...route} key={route.path} />)}</Switch>
);

const UserRoute = () => (
  <Profile>
    <Switch>{routes.map(route => <Route {...route} key={route.path} />)}</Switch>
  </Profile>
);

export const App = () => (
  <Routing>
    <Voting>
      <Helmet>
        <title>notabug: the back page of the internet</title>
        <body class="loggedin subscriber" />
      </Helmet>
      <ScrollToTop>
        <Switch>
          <Route path="/t/:topic/chat" component={cached(ChatPage)} />
          <Route path="/t/:topic/comments/*/*" component={TopicRoute} />
          <Route path="/user/:userid/*" component={UserRoute} />
          <Route path="/user/:userid" component={UserRoute} />
          <Route path="/login" component={LoginSignupPage} />
          <Route path="/chat" component={cached(ChatPage)} />
          <Route path="/*" component={PageRoute} />
          <Route path="/" component={PageRoute} />
        </Switch>
      </ScrollToTop>
      <Switch>
        <Route path="/t/:topic/chat" component={() => null} />
        <Route path="/chat" component={() => null} />
        <Route path="/*" component={Chat} />
      </Switch>
      <FooterParent />
    </Voting>
  </Routing>
);
