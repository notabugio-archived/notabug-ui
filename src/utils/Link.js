import React from "react";
import { NavLink, withRouter } from "react-router-dom";
import qs from "qs";

export const Link = withRouter((
  { href, staticContext, children, location: { search }, ...props}
) => { // eslint-disable-line
  const query = qs.parse(search, { ignoreQueryPrefix: true });
  props = Object.keys(props)
    .filter(key => key[0] === key[0].toLowerCase())
    .reduce((r, key) => {
      r[key] = props[key];
      return r;
    }, {});
  if (!((href && href[0] === "/") || href[0] === "?"))
    return <a href={href} {...props } >{children}</a>;

  let destQuery = query.indexer ? { indexer: query.indexer } : null;

  if (href.indexOf("?") !== -1) {
    const parts = href.split("?");
    const destSearch = { ...(destQuery || {}), ...qs.parse(parts.pop() || "", { ignoreQueryPrefix: true }) };
    href = parts[0] + "?" + qs.stringify(destSearch);
  } else if (destQuery) {
    href = href + "?" + qs.stringify(destQuery);
  }

  return <NavLink to={href} {...props } >{children}</NavLink>;
});
