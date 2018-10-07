import React from "react";
import SidebarSearchComponent from "./SidebarSearch";
import LoginFormSideComponent from "./LoginFormSide";
import SidebarAdComponent from "./SidebarAd";
import SubmitLinkSideboxComponent from "./SubmitLinkSidebox";
import SubmitTextSideboxComponent from "./SubmitTextSidebox";
import SidebarTitleboxComponent from "./SidebarTitlebox";
import RecentlyViewedLinksComponent from "./RecentlyViewedLinks";
import AccountActivityBoxComponent from "./AccountActivityBox";
import { optional } from "../util";

const Sidebar = ({
  SidebarSearch = SidebarSearchComponent,
  SidebarAd = SidebarAdComponent,
  SubmitLinkSidebox = SubmitLinkSideboxComponent,
  SubmitTextSidebox = SubmitTextSideboxComponent,
  SidebarTitlebox = SidebarTitleboxComponent,
  RecentlyViewedLinks = RecentlyViewedLinksComponent,
  AccountActivityBox = AccountActivityBoxComponent,
  LoginFormSide = LoginFormSideComponent,
  username,
  ...props
}) => (
  <div className="side">
    {optional(SidebarSearch, props)}
    {username ? null : optional(LoginFormSide, props)}
    {optional(SidebarAd, props)}
    {optional(SubmitLinkSidebox, props)}
    {optional(SubmitTextSidebox, props)}
    {optional(SidebarTitlebox, props)}
    {optional(RecentlyViewedLinks, props)}
    {optional(AccountActivityBox, props)}
  </div>
);

export default Sidebar;
