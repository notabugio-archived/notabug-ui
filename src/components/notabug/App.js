import React, { Fragment } from "react";
import { Helmet } from "react-helmet";
import { Route, Switch, withRouter } from "react-router-dom";
import { Subreddit } from "snew-classic-ui";
import { Topic } from "./Topic";
import { Provider } from "./Provider";
import { SidebarTitlebox } from "./SidebarTitlebox";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionDetail } from "./SubmissionDetail";
import { UserInfo } from "./UserInfo";
import { Chat } from "./Chat";
import { FooterParent } from "./FooterParent";
import { Notifications } from "./Notifications";
import { LoginSignupPage, LoginFormSide } from "./LoginSignupPage";
import { NavTab as SnewNavTab } from "snew-classic-ui";
import { Link } from "./Link";
import { router } from "state";
import ScrollToTop from "./ScrollToTop";
import { ContentPolicy } from "../ContentPolicy";
import { PrivacyPolicy } from "../PrivacyPolicy";
import { UserAgreement } from "../UserAgreement";
import { KnownPeers } from "../KnownPeers";
import { injectState } from "freactal";

const NavTab = withRouter(({
  match: { params: { sort="hot" } },
  ...props
}) =>
  ["new", "hot", "top", "controversial"].find(x => x === props.children)
    ? <SnewNavTab {...props} className={sort === props.children ? "selected" : ""} /> : null);


const TopicRoute = injectState(({
  state: { notabugUser },
  match: { params: { topic } },
}) => (
  <Subreddit
    Link={Link}
    SidebarTitlebox={SidebarTitlebox}
    FooterParent={FooterParent}
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
      <Route path="/submit" component={SubmissionForm} />
      <Route path="/:sort" component={Topic} />
      <Route path="/" exact component={Topic} />
    </Switch>
  </Subreddit>
));

export const App = router(() => (
  <Fragment>
    <Helmet>
    </Helmet>
    <Provider>
      <ScrollToTop>
        <Switch>
          <Route path="/t/:topic/:sort" component={TopicRoute} />
          <Route path="/t/:topic/*" component={TopicRoute} />
          <Route path="/t/:topic" component={TopicRoute} />
          <Route path="/domain/:domain/:sort" component={TopicRoute} />
          <Route path="/login" component={LoginSignupPage} />
          <Route path="/:sort" component={TopicRoute} />
          <Route path="/*" component={TopicRoute} />
        </Switch>
      </ScrollToTop>
      <Chat />
      <Notifications />
    </Provider>
  </Fragment>
));
