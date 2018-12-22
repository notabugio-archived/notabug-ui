import React from "react";
import { LoginFormSide } from "Auth";
import { SidebarVotingStatus } from "Voting";
import { WikiPageContent } from "Wiki";
import { UserIdLink } from "Auth";
import { Link } from "utils";

export const PageSidebar = ({ hideLogin, children }) => (
  <div className="side">
    {hideLogin ? null : <LoginFormSide />}
    {children}
    <SidebarVotingStatus />
  </div>
);

export const SidebarTitlebox = ({ path, displayName, identifier, name, owner, indexer }) => (
  <div className="spacer">
    <div className="titlebox">
      {displayName ? (<h1 className="hover redditname">
        <Link className="hover" href={path}>{displayName}</Link>
      </h1>) : null}
      <WikiPageContent { ...{ identifier, name }} />
      <div className="bottom">
        {(owner !== indexer) ? (
          <React.Fragment>
            owner: <UserIdLink userId={owner} />
          </React.Fragment>
        ) : null}
        {indexer ? (
          <React.Fragment>
            indexer: <UserIdLink userId={indexer} />
          </React.Fragment>
        ) : null}
      </div>
      <div className="clear" />
    </div>
  </div>
);

export const SubmitLinkBtn = ({ href, label="Submit a new link", type="link" }) => (
  <div className="spacer">
    <div className={`sidebox submit submit-${type==="link" ? "link" : "text"}`}>
      <div className="morelink">
        <Link
          className="login-required access-required"
          data-event-action="submit"
          data-event-detail={type === "text" ? "self" : type}
          data-type="subreddit"
          href={href}
        >
          {label}
        </Link>
        <div className="nub" />
      </div>
    </div>
  </div>
);

export const SubmitTextBtn = ({ href, label="Submit a new text post", type="text" }) => (
  <SubmitLinkBtn {...{ href, label, type }} />
);
