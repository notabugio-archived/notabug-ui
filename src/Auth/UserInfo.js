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
      onLogout={e => {
        e.preventDefault();
        onLogout();
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
  );
};
