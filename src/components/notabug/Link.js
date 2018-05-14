import React from "react";
import { NavLink } from "react-router-dom";

export const Link = ({ href, staticContext, children, ...props}) => { // eslint-disable-line
  props = Object.keys(props)
    .filter(key => key[0] === key[0].toLowerCase())
    .reduce((r, key) => {
      r[key] = props[key];
      return r;
    }, {});
  return ((href && href[0] === "/") || href[0] === "?")
    ? <NavLink to={href} {...props } >{children}</NavLink>
    : <a href={href} {...props } >{children}</a>;
};
