import React from "react";
import { SubmitLinkSidebox, SubmitTextSidebox } from "snew-classic-ui";
import { Link, JavaScriptRequired } from "utils";
import { AuthorLink, UserInfo, LoginFormSide, SidebarUserSpaces } from "Auth";
import { SrHeaderArea } from "Page/SrHeaderArea";
import { ListingInfo } from "Page/ListingInfo";
import { NavTab } from "Page/NavTab";
import { SidebarVotingStatus } from "Voting";
import { SidebarChat } from "Chat/SidebarChat";
import { useSpace } from "Space";

export const PageTemplate = ({
  match: { params: { identifier = "all" } = {} } = {},
  listingParams,
  source,
  name,
  opId,
  userId,
  tabs,
  isChat,
  submitTopic,
  hideLogin = false,
  children
}) => {
  const space = useSpace();
  return (
    <React.Fragment>
      <div id="header" role="banner">
        <a href="#content" id="jumpToContent" tabIndex={1}>
          jump to content
        </a>
        <SrHeaderArea />
        <div id="header-bottom-left">
          <Link className="default-header" href="/" id="header-img">
            notabug
          </Link>
          {space ? (
            <span className="hover pagename redditname">
              <Link href={space.path} >
                {space.displayName}
              </Link>
            </span>
          ) : name ? (
            <span className="hover pagename redditname">
              <Link
                href={`/${(listingParams && listingParams.prefix) ||
                  "t"}/${identifier}/`}
              >
                {name}
              </Link>
            </span>
          ) : null}
          {tabs && tabs.length ? (
            <ul className="tabmenu">
              {tabs.map(([name, path]) => (
                <NavTab
                  {...{ identifier, name, listingParams, opId }}
                  key={name}
                  path={path}
                />
              ))}
            </ul>
          ) : null}
        </div>
        <UserInfo />
      </div>
      <div className="side">
        {userId ? (
          <React.Fragment>
            <div className="spacer">
              <div className="titlebox">
                <h1>
                  <AuthorLink
                    className=""
                    author={name}
                    author_fullname={userId}
                  />
                </h1>
              </div>
            </div>
            <SidebarUserSpaces userId={userId} />
            {hideLogin ? null : <LoginFormSide />}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {hideLogin ? null : <LoginFormSide />}
            {submitTopic ? (
              <React.Fragment>
                <SubmitLinkSidebox
                  {...{ Link }}
                  siteprefix="t"
                  subreddit={submitTopic}
                />
                <SubmitTextSidebox
                  {...{ Link }}
                  siteprefix="t"
                  subreddit={submitTopic}
                />
              </React.Fragment>
            ) : null}
          </React.Fragment>
        )}
        <ListingInfo {...{ listingParams, userId, name, source }} />
        <JavaScriptRequired silent>
          {!isChat && submitTopic ? <SidebarChat topic={submitTopic} /> : null}
        </JavaScriptRequired>
        <SidebarVotingStatus />
      </div>
      <a name="content" key="anchor" />
      {children}
    </React.Fragment>
  );
};
