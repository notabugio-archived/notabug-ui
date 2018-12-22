import React from "react";
import { AuthorLink, SidebarUserSpaces } from "Auth";
import { PageName, PageTabs } from "Page/Tabs";
import { PageHeader } from "Page/Header";
import {
  PageSidebar,
  SidebarTitlebox,
  SubmitLinkBtn,
  SubmitTextBtn
} from "Page/Sidebar";
import { SidebarChat } from "Chat/SidebarChat";
import { SidebarUserList } from "Auth/SidebarUserList";
import { TopicList } from "Page/TopicList";
import { SidebarSource } from "Page/SidebarSource";

export const PageTemplate = ({
  children,
  listingParams,
  name,
  userId,
  isChat,
  hideLogin,
  match: { params: { identifier = "all" } = {} } = {},
  meta: {
    path,
    displayName,
    submitTopic,
    chatTopic,
    tabs,
    curators,
    censors,
    indexer,
    filters: { allow: { topics } = {} } = {},
    fromPageAuthor: ownerId,
    fromPageName: pageName
  } = {}
}) => (
  <React.Fragment>
    <PageHeader>
      <PageName
        path={
          path ||
          `/${(listingParams && listingParams.prefix) || "t"}/${identifier}/`
        }
        name={displayName || name}
      />
      <PageTabs {...{ listingParams, tabs }} />
    </PageHeader>

    <PageSidebar hideLogin={hideLogin}>
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
        </React.Fragment>
      ) : null}

      {submitTopic ? (
        <React.Fragment>
          <SubmitLinkBtn href={`/t/${submitTopic}/submit`} />
          <SubmitTextBtn href={`/t/${submitTopic}/submit?selftext=true`} />
        </React.Fragment>
      ) : null}

      {!userId && ownerId && pageName ? (
        <SidebarTitlebox
          path=""
          displayName={userId ? null : displayName}
          identifier={ownerId}
          name={`${pageName}:sidebar`}
          owner={ownerId}
          indexer={indexer}
        />
      ) : null}

      <TopicList {...{ topics }} />
      <SidebarUserList title="CURATORS" ids={curators} />
      <SidebarUserList title="CENSORS" ids={censors} />
      <SidebarSource identifier={ownerId} name={pageName} />
      {isChat ? null : <SidebarChat topic={chatTopic} />}
    </PageSidebar>

    {children}
  </React.Fragment>
);
