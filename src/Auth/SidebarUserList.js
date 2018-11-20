import React, { useState, useCallback } from "react";
import { UserIdLink } from "Auth";

export const SidebarUserList = ({ title = "users", ids, foldSize = 5 }) => {
  const [visibleCount, setVisibleCount] = useState(foldSize);
  const moreCount = (ids && ids.length || 0) - visibleCount;
  const hasMore = moreCount > 0;

  const onShowMore = useCallback(
    evt => {
      evt && evt.preventDefault();
      setVisibleCount(ids.length);
    },
    [ids.length]
  );

  if (!ids || !ids.length) return null;

  return (
    <div className="spacer">
      <div className="sidecontentbox">
        <div className="title">
          <h1>{title}</h1>
        </div>
        <ul className="content">
          {ids.slice(0, visibleCount).map(userId => (
            <li key={userId}>
              <UserIdLink {...{ userId }} />
            </li>
          ))}
          {hasMore ? (
            <li className="more">
              <a href="" onClick={onShowMore}>
                ... and {moreCount} more...
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};
