import React from "react";
import { Link } from "/utils";
import { UserInfo } from "/Auth";
import { TopBar } from "/Page/TopBar";

export const PageHeader = ({ children }) => (
  <div id="header" role="banner">
    <a href="#content" id="jumpToContent" tabIndex={1}>
      jump to content
    </a>
    <TopBar />
    <div id="header-bottom-left">
      <Link className="default-header" href="/" id="header-img">
        notabug
      </Link>
      {children}
    </div>
    <UserInfo />
  </div>
);
