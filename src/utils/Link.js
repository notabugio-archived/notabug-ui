import React from "react";
import { Link as RegLink, NavLink, withRouter } from "react-router-dom";
import qs from "query-string";

export const Link = withRouter((
  // eslint-disable-next-line no-unused-vars
  { href, staticContext, children, location: { search }, ...props}
) => {
  const query = qs.parse(search, { ignoreQueryPrefix: true });

  props = Object.keys(props)
    .filter(key => key[0] === key[0].toLowerCase())
    .reduce((r, key) => {
      r[key] = props[key];
      return r;
    }, {});
  if (!href || !((href[0] === "/") || href[0] === "?"))
    return <a href={href} {...props } >{children}</a>;

  let destQuery = query.indexer ? { indexer: query.indexer } : null;

  if (href.indexOf("?") !== -1) {
    const parts = href.split("?");
    const destSearch = { ...(destQuery || {}), ...qs.parse(parts.pop() || "") };

    href = parts[0] + "?" + qs.stringify(destSearch);
  } else if (destQuery) {
    href = href + "?" + qs.stringify(destQuery);
  }

  const LinkComponent = props.activeClass ? NavLink : RegLink;

  return <LinkComponent to={href} {...props } >{children}</LinkComponent>;
});
