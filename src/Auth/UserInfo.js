import React from "react";
import { injectState } from "freactal";
import { UserInfo as SnewUserInfo } from "snew-classic-ui";
import { Link } from "utils";
import { AuthorLink } from "./AuthorLink";

export const UserInfo = injectState(({
  state: { notabugUser, notabugUserId },
  effects,
  ...props
}) => notabugUser ? (
  <SnewUserInfo
    {...props}
    Link={Link}
    AuthorLink={AuthorLink}
    username={notabugUser}
    fullname={notabugUserId}
    onLogout={e => {
      e.preventDefault();
      effects.onLogout();
    }}
    loginUrl="/login"
    messagesUrl="/message/inbox"
  />
) : (
  <div id="header-bottom-right">
    <a href="/login?sea" className="login-required">
      no account needed to participate. sign up (ALPHA)
    </a>
  </div>
));
