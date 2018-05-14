import React from "react";
import { path } from "ramda";
import { Route, Switch } from "react-router-dom";
import { Subreddit } from "snew-classic-ui";
import { Topic, TopicIndex } from "./Topic";
import { Provider } from "./Provider";
import { SidebarTitlebox } from "./SidebarTitlebox";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionDetail } from "./SubmissionDetail";
import { FooterParent } from "./FooterParent";
import { NavTab as SnewNavTab } from "snew-classic-ui";
import { Link } from "./Link";
import { router } from "state";

const NavTab = (props) =>
  ["new", "hot", "top", "controversial"].find(x => x === props.children)
    ? <SnewNavTab {...props} /> : null;


const TopicRouteBase = (({ topic, domain }) => (
  <Topic topic={topic || "all"} domain={domain}>
    <Subreddit
      Link={Link}
      SidebarTitlebox={SidebarTitlebox}
      FooterParent={FooterParent}
      LoginFormSide={() => null}
      SidebarSearch={() => null}
      RecentlyViewedLinks={() => null}
      AccountActivityBox={() => null}
      UserInfo={() => null}
      Timestamp={() => null}
      SrHeaderArea={() => null}
      NavTab={NavTab}
      subreddit={topic || ""}
      siteprefix="t"
      isShowingCustomStyleOption={false}
    >
      <Switch>
        <Route path="/t/:topic/comments/:submission_id/:slug" component={SubmissionDetail} />
        <Route path="/t/:topic/comments/:submission_id" component={SubmissionDetail} />
        <Route path="/t/:topic/submit" component={SubmissionForm} />
        <Route path="/t/:topic/:sort/" component={TopicIndex} />
        <Route path="/domain/:domain/:sort/" component={TopicIndex} />
        <Route path="/domain/:domain" component={TopicIndex} />
        <Route path="/submit" component={SubmissionForm} />
        <Route path="/:sort" component={TopicIndex} />
        <Route path="/" exact component={TopicIndex} />
      </Switch>
    </Subreddit>
  </Topic>
));

const TopicRoute = (props) => (
  <TopicRouteBase
    topic={path(["match", "params", "topic"], props)}
    domain={path(["match", "params", "domain"], props)}
  />
);

export const App = router(() => (
  <Provider>
    <Switch>
      <Route path="/t/:topic/:sort/" component={TopicRoute} />
      <Route path="/t/:topic" component={TopicRoute} />
      <Route path="/domain/:domain/:sort/" component={TopicRoute} />
      <Route path="/domain/:domain" component={TopicRoute} />
      <Route path="/:sort" component={TopicRoute} />
      <Route path="/*" component={TopicRoute} />
    </Switch>
  </Provider>
));
