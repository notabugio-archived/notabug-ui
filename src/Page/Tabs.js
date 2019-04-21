import React from "react";
import { Link } from "/utils";
import { NavTab } from "/vendor/snew-classic-ui";
import { usePageContext } from "/NabContext";

export const PageName = ({ path, name }) => {
  if (!name) return null;
  return (
    <span className="hover pagename redditname">
      <Link href={path}>{name} </Link>
    </span>
  );
};

export const PageTab = ({ name, path }) => {
  const {
    spec: { path: current }
  } = usePageContext();

  return (
    <NavTab
      {...{ Link, href: path }}
      className={current.match(path) ? "selected" : ""}
    >
      {name}
    </NavTab>
  );
};

export const PageTabs = ({ tabs }) => (
  <ul className="tabmenu">
    {(tabs || []).map(([name, path]) => (
      <PageTab key={name} {...{ path, name }} />
    ))}
  </ul>
);
