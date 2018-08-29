import React from "react";
import { withRouter } from "react-router-dom";
import { injectState } from "freactal";
import { Subreddit } from "snew-classic-ui";
import { Link } from "utils";
import { SidebarTitlebox } from "App/SidebarTitlebox";
import { NavTab } from "App/NavTab";
import { UserInfo, LoginFormSide } from "Auth";
import { Chat } from "./Chat";

export const ChatPage = ({
  state: { notabugUser },
  match: { params: { topic } },
}) => (
  <Subreddit
    Link={Link}
    SidebarTitlebox={SidebarTitlebox}
    FooterParent={() => null}
    SidebarSearch={() => null}
    LoginFormSide={LoginFormSide}
    RecentlyViewedLinks={() => null}
    AccountActivityBox={() => null}
    Timestamp={() => null}
    SrHeaderArea={() => null}
    UserInfo={UserInfo}
    NavTab={NavTab}
    username={notabugUser}
    subreddit={topic || ""}
    siteprefix="t"
    isShowingCustomStyleOption={false}
  >
    <Chat className="fullscreen-chat" isOpen withSubmissions />
  </Subreddit>
);

export default withRouter(injectState(ChatPage));
