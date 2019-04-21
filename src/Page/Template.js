import React from "react";
import { usePageContext } from "/NabContext";
import { PageName, PageTabs } from "/Page/Tabs";
import { PageHeader } from "/Page/Header";
import {
  PageSidebar,
  SidebarTitlebox,
  SubmitLinkBtn,
  SubmitTextBtn
} from "/Page/Sidebar";
import { SidebarChat } from "/Chat/SidebarChat";
import { SidebarUserList } from "/Auth/SidebarUserList";
import { TopicList } from "/Page/TopicList";
import { SidebarSource } from "/Page/SidebarSource";

export const PageTemplate = ({ children, name: nameProp, hideLogin }) => {
  const { spec } = usePageContext();
  const {
    profileId,
    name: listingName,
    basePath,
    displayName,
    submitPath = null,
    chatTopic,
    tabs,
    curators,
    censors,
    indexer,
    filters: { allow: { topics } = {} } = {},
    fromPageAuthor: ownerId,
    fromPageName: pageName
  } = spec || {};
  const name = nameProp || listingName || displayName;

  return (
    <React.Fragment>
      <PageHeader>
        <PageName path={basePath} name={displayName || name} />
        <PageTabs {...{ tabs }} />
      </PageHeader>

      <PageSidebar {...{ profileId, name, hideLogin }}>
        <SubmitLinkBtn href={submitPath} />
        <SubmitTextBtn
          href={submitPath ? `${submitPath}?selftext=true` : null}
        />

        <SidebarTitlebox
          basePath={basePath}
          profileId={profileId}
          displayName={displayName}
          identifier={ownerId}
          pageName={`${pageName}:sidebar`}
          owner={ownerId}
          indexer={indexer}
        />

        <TopicList {...{ topics }} />
        <SidebarUserList title="CURATORS" ids={curators} />
        <SidebarUserList title="CENSORS" ids={censors} />
        <SidebarSource identifier={ownerId} name={pageName} />
        {chatTopic ? <SidebarChat topic={chatTopic} /> : null}
      </PageSidebar>

      {children}
    </React.Fragment>
  );
};
