import React from "react";
import { SubmitLinkSidebox, SubmitTextSidebox } from "snew-classic-ui";
import { Link, Timestamp } from "utils";
import { UserIdLink, AuthorLink, UserInfo, LoginFormSide } from "Auth";
import { SidebarTitlebox } from "Page/SidebarTitlebox";
import { SrHeaderArea } from "Page/SrHeaderArea";
import { ListingInfo } from "Page/ListingInfo";
import { NavTab } from "Page/NavTab";
import { SidebarVotingStatus } from "Voting";

export const PageTemplate = ({
  match: { params: { identifier = "all" } = {} } = {},
  listingParams,
  source,
  name,
  opId,
  userId,
  tabs,
  submitTopic,
  createdAt,
  hideLogin = false,
  children
}) => (
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
        {name ? (
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
                    created <Timestamp {...{ created_utc: createdAt }} />
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {hideLogin ? null : <LoginFormSide />}
          <SidebarVotingStatus />
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
              <SidebarVotingStatus />
              <SidebarTitlebox
                {...{ Link }}
                siteprefix="t"
                subreddit={name}
                bottom={
                  listingParams && listingParams.indexer ? (
                    <React.Fragment>
                      indexed by <UserIdLink userId={listingParams.indexer} />
                    </React.Fragment>
                  ) : null
                }
              />
            </React.Fragment>
          ) : null}
        </React.Fragment>
      )}
      <ListingInfo {...{ source }} />
    </div>
    <a name="content" key="anchor" />
    {children}
  </React.Fragment>
);
