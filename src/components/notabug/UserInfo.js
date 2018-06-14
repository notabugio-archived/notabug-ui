import React from "react";
import { UserInfo as SnewUserInfo } from "snew-classic-ui";
import { Link } from "./Link";
import { injectState } from "freactal";

export const UserInfo = injectState(({
  state: { notabugApi, notabugUser },
  ...props
}) => notabugApi.gun.user ? (
  <SnewUserInfo
    {...props}
    Link={Link}
    username={notabugUser}
    onLogout={() => window.location.reload()}
    loginUrl="/login"
  />
) : null);
