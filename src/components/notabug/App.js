import React from "react";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";
import { Subreddit } from "snew-classic-ui";
import { NavTab } from "./NavTab";
import { Topic } from "./Topic";
import { Provider } from "./Provider";
import { SidebarTitlebox } from "./SidebarTitlebox";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionDetail } from "./SubmissionDetail";
import { UserInfo } from "./UserInfo";
import { Chat, ChatPage } from "./Chat";
import { FooterParent } from "./FooterParent";
import { Notifications } from "./Notifications";
import { LoginSignupPage, LoginFormSide } from "./LoginSignupPage";
import { Link } from "./Link";
import { router } from "state";
import ScrollToTop from "./ScrollToTop";
import { ContentPolicy } from "../ContentPolicy";
import { PrivacyPolicy } from "../PrivacyPolicy";
import { UserAgreement } from "../UserAgreement";
import { KnownPeers } from "../KnownPeers";
import { injectState } from "freactal";

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
      <Route path="/help/privacypolicy" component={PrivacyPolicy} />
      <Route path="/help/useragreement" component={UserAgreement} />
      <Route path="/help/contentpolicy" component={ContentPolicy} />
      <Route path="/help/knownpeers" component={KnownPeers} />
      <Route path="/rules" component={ContentPolicy} />
      <Route path="/t/:topic/comments/:submission_id/:slug" component={SubmissionDetail} />
      <Route path="/t/:topic/comments/:submission_id" component={SubmissionDetail} />
      <Route path="/t/:topic/submit" component={SubmissionForm} />
      <Route path="/t/:topic/:sort/" component={Topic} />
      <Route path="/t/:topic" component={Topic} />
      <Route path="/domain/:domain/:sort" component={Topic} />
      <Route path="/domain/:domain" component={Topic} />
      <Route path="/user/:username" component={() => (
        <div className="reddit-infobar">
          <h1>User profiles not implemented yet, Sorry!</h1>
          <h4>
            They will be, in classic open-source reddit style with karma counts, and orangereds plus encrypted private messaging.   Be patient, or help out
          </h4>
          <h4>Your current contributions will be on your profile when they are ready</h4>
        </div>
      )} />
      <Route path="/r/*" component={({ location: { pathname, search } }) => (
        <div className="reddit-infobar">
          <h1>This isn't snew</h1>
          <h4>
            {"Yes they share some code, but you're looking for "}
            <a href={`https://snew.github.io${pathname}${search}`}>snew.github.io</a>
          </h4>
        </div>
      )} />
      <Route path="/submit" component={SubmissionForm} />
      <Route path="/:sort" component={Topic} />
      <Route path="/" exact component={Topic} />
    </Switch>
  </Subreddit>
));

export const App = router(() => (
  <Provider>
    <Helmet>
      <title>notabug: the back page of the internet</title>
    </Helmet>
    <ScrollToTop>
      <Switch>
        <Route path="/t/:topic/chat" component={ChatPage} />
        <Route path="/t/:topic/comments/*/*" component={TopicRoute} />
        <Route path="/t/:topic/:sort/" component={TopicRoute} />
        <Route path="/t/:topic/*" component={TopicRoute} />
        <Route path="/t/:topic" component={TopicRoute} />
        <Route path="/domain/:domain/:sort" component={TopicRoute} />
        <Route path="/login" component={LoginSignupPage} />
        <Route path="/chat" component={ChatPage} />
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
