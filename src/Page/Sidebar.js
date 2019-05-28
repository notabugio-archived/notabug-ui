import React from "react";
import { LoginFormSide, AuthorLink, SidebarUserSpaces } from "/Auth";
import { SidebarVotingStatus } from "/Voting";
import { WikiPageContent } from "/Wiki";
import { UserIdLink } from "/Auth";
import { Link } from "/utils";

export const PageSidebar = ({ profileId, name, hideLogin, children }) => (
  <div className="side">
    {profileId ? (
      <React.Fragment>
        <div className="spacer">
          <div className="titlebox">
            <h1>
              <AuthorLink
                className=""
                author={name}
                author_fullname={profileId}
              />
            </h1>
            <WikiPageContent {...{ identifier: profileId, name: "profile" }} />
          </div>
        </div>
        <SidebarUserSpaces userId={profileId} />
      </React.Fragment>
    ) : null}
    {hideLogin ? null : <LoginFormSide />}
    {children}
    <SidebarVotingStatus />
  </div>
);

export const SidebarTitlebox = ({
  basePath,
  displayName,
  profileId,
  identifier,
  pageName,
  owner,
  indexer
}) => {
  if (!owner || !pageName) return null;
  return (
    <div className="spacer">
      <div className="titlebox">
        {displayName && !profileId ? (
          <h1 className="hover redditname">
            <Link className="hover" href={basePath}>
              {displayName}
            </Link>
          </h1>
        ) : null}
        <WikiPageContent {...{ identifier, name: pageName }} />
        <div className="bottom">
          {owner !== indexer ? (
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
};

export const SubmitLinkBtn = ({
  href,
  label = "Submit a new link",
  type = "link"
}) =>
  href ? (
    <div className="spacer">
      <div
        className={`sidebox submit submit-${type === "link" ? "link" : "text"}`}
      >
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
  ) : null;

export const SubmitTextBtn = ({
  href,
  label = "Submit a new text post",
  type = "text"
}) => <SubmitLinkBtn {...{ href, label, type }} />;
