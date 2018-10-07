import React from "react";
import SrHeaderAreaComponent from "./SrHeaderArea";
import HeaderBottomLeftComponent from "./HeaderBottomLeft";
import UserInfoComponent from "./UserInfo";
import NavTabComponent from "./NavTab";
import LinkComponent from "./Link";
import { optional } from "../util";

const ProfileHeader = ({
  SrHeaderArea = SrHeaderAreaComponent,
  HeaderBottomLeft = HeaderBottomLeftComponent,
  UserInfo = UserInfoComponent,
  NavTab = NavTabComponent,
  Link = LinkComponent,
  profileuser_username,
  ...props
}) => (
  <div id="header" role="banner">
    <a href="#content" id="jumpToContent" tabIndex={1}>
      jump to content
    </a>
    {optional(SrHeaderArea, props)}
    <div id="header-bottom-left">
      <Link
        className="default-header"
        href="/"
        id="header-img"
      >
        snew
      </Link>
      <span className="pagename selected">{profileuser_username}</span>
      <ul className="tabmenu">
        <NavTab {...{ ...props, Link }} href={`/user/${profileuser_username}`}>overview</NavTab>
        <NavTab {...{ ...props, Link }} href={`/user/${profileuser_username}/comments`}>comments</NavTab>
        <NavTab {...{ ...props, Link }} href={`/user/${profileuser_username}/submitted`}>submitted</NavTab>
      </ul>
    </div>
    {optional(UserInfo, props)}
  </div>
);

export default ProfileHeader;


