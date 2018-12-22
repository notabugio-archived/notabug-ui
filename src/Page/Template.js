import React from "react";
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
          `/${(listingParams && listingParams.prefix) || "t"}/${identifier}`
        }
        name={displayName || name}
      />
      <PageTabs {...{ listingParams, tabs }} />
    </PageHeader>

    <PageSidebar {...{ userId, name, hideLogin }}>
      <SubmitLinkBtn href={submitTopic ? `/t/${submitTopic}/submit` : null} />
      <SubmitTextBtn
        href={submitTopic ? `/t/${submitTopic}/submit?selftext=true` : null}
      />

      <SidebarTitlebox
        path={path || ""}
        displayName={userId ? null : displayName}
        identifier={ownerId}
        pageName={`${pageName}:sidebar`}
        owner={ownerId}
        indexer={indexer}
      />

      <TopicList {...{ topics }} />
      <SidebarUserList title="CURATORS" ids={curators} />
      <SidebarUserList title="CENSORS" ids={censors} />
      <SidebarSource identifier={ownerId} name={pageName} />
      <SidebarChat topic={chatTopic} />
    </PageSidebar>

    {children}
  </React.Fragment>
);
