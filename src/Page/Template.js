import React from "react";
import { SubmitLinkSidebox, SubmitTextSidebox } from "snew-classic-ui";
import { Link, Timestamp } from "utils";
import { UserIdLink, AuthorLink, UserInfo, LoginFormSide } from "Auth";
import { SidebarTitlebox } from "Page/SidebarTitlebox";
import { SrHeaderArea } from "Page/SrHeaderArea";
import { NavTab } from "Page/NavTab";

export const PageTemplate = ({
  match: { params: { identifier="all" }={} }={},
  listingParams,
  name,
  opId,
  userId,
  tabs,
  submitTopic,
  createdAt,
  hideLogin=false,
  curators=[],
  censors=[],
  children
}) => (
  <React.Fragment>
    <div id="header" role="banner">
      <a href="#content" id="jumpToContent" tabIndex={1}>
        jump to content
      </a>
      <SrHeaderArea />
      <div id="header-bottom-left">
        <Link
          className="default-header"
          href="/"
          id="header-img"
        >
          notabug
        </Link>
        {name ? (
          <span className="hover pagename redditname">
            <Link href={`/${listingParams.prefix || "t"}/${identifier}/`}>{name}</Link>
          </span>
        ) : null}
        {tabs && tabs.length ? (
          <ul className="tabmenu">
            {tabs.map(tab => (
              <NavTab
                {...{ identifier, listingParams, opId }}
                key={tab}
                soul={tab}
                prefix={listingParams.prefix || "t"}
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
              <div className="bottom">
                {createdAt ? (
                  <span className="age">
                    created <Timestamp {...{ created_utc:createdAt }} />
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {hideLogin ? null : <LoginFormSide />}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {hideLogin ? null : <LoginFormSide />}
          {submitTopic ? (
            <React.Fragment>
              <SubmitLinkSidebox {...{ Link }} siteprefix="t" subreddit={submitTopic} />
              <SubmitTextSidebox {...{ Link }} siteprefix="t" subreddit={submitTopic} />
              <SidebarTitlebox {...{ Link }} siteprefix="t" subreddit={name} />
            </React.Fragment>
          ) : null}
          {censors && censors.length ? (
            <div className="spacer">
              <div className="sidecontentbox">
                <div className="title"><h1>CENSORS</h1></div>
                <ul className="content">
                  {censors.map(userId => <li><UserIdLink {...{ userId }} /></li>)}
                </ul>
              </div>
            </div>
          ) : null}
          {curators && curators.length ? (
            <div className="spacer">
              <div className="sidecontentbox">
                <div className="title"><h1>CURATORS</h1></div>
                <ul className="content">
                  {curators.map(userId => <li><UserIdLink {...{ userId }} /></li>)}
                </ul>
              </div>
            </div>
          ) : null}
        </React.Fragment>
      )}
    </div>
    <a name="content" key="anchor" />
    {children}
  </React.Fragment>
);

