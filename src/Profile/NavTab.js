import React from "react";
import { NavTab as SnewNavTab } from "snew-classic-ui";
import { Link } from "utils";
import { withRouter } from "react-router-dom";

export const NavTab = withRouter(({
  location: { pathname },
  profileuser_fullname,
  ...other
}) => {
  const props = { ...other, Link };
  const paths = {
    overview: `/user/${profileuser_fullname}`,
    submitted: `/user/${profileuser_fullname}/submitted`,
    comments: `/user/${profileuser_fullname}/comments`
  };
  const className = href => (pathname === href || pathname === `${href}/`) ? "selected" : "";
  const tabs = {
    overview: <SnewNavTab {...props} href={paths.overview} className={className(paths.overview)} />,
    comments: <SnewNavTab {...props} href={paths.comments} className={className(paths.comments)} />,
    submitted: <SnewNavTab {...props} href={paths.submitted} className={className(paths.submitted)} />,
  };
  return tabs[props.children] || null;
});

