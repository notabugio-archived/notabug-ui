import React from "react";
import { NavTab as SnewNavTab, SubmitLinkSidebox, SubmitTextSidebox } from "snew-classic-ui";
import { Link, Timestamp } from "utils";
import { AuthorLink, UserInfo, LoginFormSide } from "Auth";
import { SidebarTitlebox } from "App/SidebarTitlebox";
import { Content } from "Page/Content";
import { NestedContent } from "Page/NestedContent";
import { NavTab } from "Page/NavTab";
import { ListingIds } from "Listing/Ids";

export const Page = ({
  match: { params: { identifier="all" } },
  location,
  listingParams
}) => (
  <ListingIds {...{ listingParams }}>
    {({ name, opId, userId, tabs, submitTopic, includeRanks, createdAt }) => (
      <React.Fragment>
        <div id="header" role="banner">
          <a href="#content" id="jumpToContent" tabIndex={1}>
            jump to content
          </a>
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
            {tabs.length ? (
              <ul className="tabmenu">
                {tabs.map(tab => (
                  <NavTab
                    {...{ identifier, listingParams, opId }}
                    key={tab}
                    soul={tab}
                    prefix={listingParams.prefix || "t"}
                  />
                ))}
                {userId ? null : <SnewNavTab {...{ Link, href: "/chat" }}>firehose</SnewNavTab>}
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
              <LoginFormSide />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <LoginFormSide />
              {submitTopic ? (
                <React.Fragment>
                  <SubmitLinkSidebox siteprefix="t" subreddit={submitTopic} />
                  <SubmitTextSidebox siteprefix="t" subreddit={submitTopic} />
                  <SidebarTitlebox siteprefix="t" subreddit={name} />
                </React.Fragment>
              ) : null}
            </React.Fragment>
          )}
        </div>
        <a name="content" key="anchor" />
        {opId ? (
          <NestedContent {...{ opId, submitTopic, location, listingParams }} />
        ) : (
          <Content {...{ location, includeRanks, listingParams }} />
        )}
        <p className="bottommenu debuginfo" key="debuginfo">,
          <span className="icon">π</span> <span className="content" />
        </p>
      </React.Fragment>
    )}
  </ListingIds>
);
