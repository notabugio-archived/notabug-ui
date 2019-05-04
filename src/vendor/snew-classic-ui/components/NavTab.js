import React from "react";
import LinkComponent from "./Link";

const NavTab = ({
  Link = LinkComponent,
  className,
  ...props
}) => (
  <li className={className}>
    <Link {...props} />
  </li>
);

export default NavTab;
