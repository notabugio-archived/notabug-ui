import React, { useContext } from "react";
import { keysIn, match, compose, prop, replace } from "ramda";
import { NabContext } from "NabContext";
import { Link, useQuery, useShowMore } from "utils";

export const SidebarUserSpaces = ({ userId }) => {
  const { api } = useContext(NabContext);
  const [pages] = useQuery(api.queries.userPages, [userId]);
  const spaceNames = keysIn(pages)
    .filter(compose(prop("length"), match(/^space:[^:]*$/)))
    .map(replace(/^space:/, ""))
    .sort();
  const { visibleCount, moreCount, onShowMore } = useShowMore(spaceNames);
  const hasMore = moreCount > 0;

  if (!spaceNames.length) return null;
  return (
    <div className="spacer">
      <div className="sidecontentbox">
        <div className="title">
          <h1>spaces</h1>
        </div>
        <ul className="content">
          {spaceNames.slice(0, visibleCount).map(name => (
            <li key={name}>
              <Link href={`/user/${userId}/spaces/${name}`}>{name}</Link>
            </li>
          ))}
          {hasMore ? (
            <li>
              <button className="expand-summary" onClick={onShowMore}>
                ... and {moreCount} more...
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};
