import React from "react";
import { UserInfo as SnewUserInfo } from "snew-classic-ui";
import { Link } from "./Link";
import { injectState } from "freactal";

export const UserInfo = injectState(({
  state: { notabugApi, notabugUser },
  ...props
}) => notabugApi.gun.user ?
  notabugUser ? (
    <SnewUserInfo
      {...props}
      Link={Link}
      username={notabugUser}
      onLogout={() => window.location.reload()}
      loginUrl="/login"
    />
  ) : (
    <div id="header-bottom-right">
      <Link href="/login" className="login-required">
        no account needed to participate. sign up
      </Link>
    </div>
  )
  : null);
