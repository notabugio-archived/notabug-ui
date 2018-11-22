import React, { useContext } from "react";
import { NabContext } from "NabContext";
import { UserInfo as SnewUserInfo } from "snew-classic-ui";
import { Link } from "utils";
import { AuthorLink } from "./AuthorLink";

export const UserInfo = props => {
  const { me, onLogout } = useContext(NabContext);
  return me ? (
    <SnewUserInfo
      {...{ ...props, Link, AuthorLink }}
      username={me.alias}
      fullname={me.pub}
      onLogout={onLogout}
      loginUrl="/login"
      messagesUrl="/message/inbox"
    />
  ) : (
    <div id="header-bottom-right">
      <Link href="/login" className="login-required">
        create a new identity
      </Link>
    </div>
  );
};
