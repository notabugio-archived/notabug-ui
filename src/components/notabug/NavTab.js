import React from "react";
import { NavTab as SnewNavTab } from "snew-classic-ui";
import { withRouter } from "react-router-dom";

const chatRe = /\/chat$/;

export const NavTab = withRouter(({
  match: { params: { sort="hot" }, path },
  ...props
}) => {
  const isChat = chatRe.test(path);
  return ["new", "hot", "top", "controversial"].find(x => x === props.children)
    ? <SnewNavTab {...props} className={!isChat && sort === props.children ? "selected" : ""} />
    : props.children === "gilded"
      ? (
        <SnewNavTab
          {...props}
          className={isChat ? "selected" : ""}
          href={props.href.replace("gilded", "chat")}
        >chat</SnewNavTab>
      )
      : props.children === "rising" ? (
        <SnewNavTab
          {...props}
          className={sort==="comments" ? "selected" : ""}
          href={props.href.replace("rising", "comments")}
        >discussed</SnewNavTab>
      ) : null;
});
