import React from "react";
import { UserInfo as SnewUserInfo } from "snew-classic-ui";
import { Link } from "./Link";
import { injectState } from "freactal";

export const UserInfo = injectState(({
  state: { notabugUser },
  ...props
}) => notabugUser ? (
  <SnewUserInfo
    {...props}
    Link={Link}
    username={notabugUser}
    onLogout={() => window.location.reload()}
    loginUrl="/login"
  />
) : (
  <div id="header-bottom-right">
    <a href="/login?sea" className="login-required">
      no account needed to participate. sign up (ALPHA)
    </a>
  </div>
));
