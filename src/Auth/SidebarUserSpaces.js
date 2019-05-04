import React from "react";
import { SpaceSpec } from "@notabug/peer";
import { Link, useQuery, useShowMore } from "/utils";

export const SidebarUserSpaces = ({ userId }) => {
  console.log("userId", userId);
  const [spaceNames = []] = useQuery(SpaceSpec.userSpaceNames, [userId]);
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
