import React from "react";
import { Link } from "utils";
import { NavTab } from "snew-classic-ui";

export const PageName = ({ path, name }) => {
  if (!name) return null;
  return (
    <span className="hover pagename redditname">
      <Link href={path}>{name} </Link>
    </span>
  );
};

export const PageTab = ({ name, path, listingParams }) => (
  <NavTab
    {...{ Link, href: path }}
    className={listingParams.soul.match(path) ? "selected" : ""}
  >
    {name}
  </NavTab>
);

export const PageTabs = ({ tabs, listingParams }) => (
  <ul className="tabmenu">
    {(tabs || []).map(([name, path]) => (
      <PageTab key={name} {...{ path, name, listingParams }} />
    ))}
  </ul>
);
