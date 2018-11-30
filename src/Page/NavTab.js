import React from "react";
import { PREFIX } from "notabug-peer";
import { Link } from "utils";
import { NavTab as SnewNavTab } from "snew-classic-ui";

const PREFIX_RE = new RegExp(`^${PREFIX}`);

export const NavTab = ({ soul, listingParams, opId }) => {
  const parts = soul.split("@~");
  const pathParts = (parts[0] || "").split("/");
  let href = (parts[0] || "").replace(PREFIX_RE, "");
  let name = pathParts.pop();
  if (listingParams.type || opId) {
    name = pathParts.pop();
  }
  if (listingParams.type) {
    href = href.replace(new RegExp(`/${listingParams.sort}$`), "");
  }
  if (opId) {
    href = ""; // XXX: Temporary hack
  }
  return (
    <SnewNavTab
      {...{ Link, href }}
      className={soul === listingParams.soul ? "selected" : ""}
    >{name}</SnewNavTab>
  );
};
