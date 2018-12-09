import React from "react";
import { Link } from "utils";
import { NavTab as SnewNavTab } from "snew-classic-ui";

export const NavTab = ({ name, path, listingParams }) => {
  const href = path;
  return (
    <SnewNavTab
      {...{ Link, href }}
      className={listingParams.soul.match(path) ? "selected" : ""}
    >{name}</SnewNavTab>
  );
};
