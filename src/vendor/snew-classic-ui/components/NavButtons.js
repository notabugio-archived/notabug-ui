import React from "react";
const serialize = obj => Object.keys(obj).reduce(
  (a, k) => (obj[k] && a.push(k + "=" + encodeURIComponent(obj[k])) && a) || a, []).join("&");

const NavButtons = ({ Link, params, path, after, before, count, limit }) => (after || before) ? (
  <div className="nav-buttons">
    <span className="nextprev">
      {"view more: "}
      {before && (
        <Link
          rel="nofollow prev"
          href={`${path}?${serialize({ ...params, before, count: count + 1, after: "" })}`}
        >‹ prev</Link>
      )}
      {after && before && <span className="separator" />}
      {after && (
        <Link
          rel="nofollow next"
          href={`${path}?${serialize({ ...params, after, count: count + limit, before: "" })}`}
        >next ›</Link>
      )}
    </span>
  </div>
) : null;

export default NavButtons;
