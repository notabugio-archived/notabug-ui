import React, { useContext } from "react";
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
import { useSpace } from "Space";

export const PageTemplate = ({
  ListingContext,
  children,
  name: nameProp,
  hideLogin,
  match: { params: { identifier = "all" } = {} } = {}
}) => {
  const listingData = useContext(ListingContext || {});
  const space = useSpace();
  const { listingParams, userId, name: listingName } = listingData || {};
  const {
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
  } = space || listingData || {};
  const name = nameProp || listingName || displayName;
  const submitPath =
    (submitTopic && space && path && `${path}/submit`) ||
    (submitTopic && `/t/${submitTopic}/submit`) ||
    null;

  return (
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
        <SubmitLinkBtn href={submitPath || null} />
        <SubmitTextBtn
          href={submitPath ? `${submitPath}?selftext=true` : null}
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
};
