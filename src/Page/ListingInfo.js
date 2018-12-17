import React, { useState, useMemo, useCallback } from "react";
import { prop } from "ramda";
import { JavaScriptRequired, Link } from "utils";
import { UserIdLink } from "Auth";
import { WikiPageContent } from "Wiki";
import { SidebarUserList } from "Auth/SidebarUserList";
import { TopicList } from "Page/TopicList";
import { useSpace } from "Space";
import { parseListingSource } from "notabug-peer/listings";

export const ListingInfo = React.memo(({ userId, listingParams, name, source }) => {
  const space = useSpace();
  const { curators, censors, topics, authorId, pageName } = useMemo(
    () => {
      const { getValues, getValueChain } = parseListingSource(source || "");
      const curators = getValues("curator");
      const censors = getValues("censor");
      const topics = getValues("topic");
      const [authorId, pageName] = getValueChain(["sourced", "from", "page"]);
      return { curators, censors, topics, authorId, pageName };
    },
    [source]
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const onToggle = useCallback(evt => {
    evt && evt.preventDefault();
    setIsExpanded(ex => !ex);
  }, []);

  const indexer = prop("indexer", space) || prop("indexer", listingParams);
  const ownerId = prop("owner", space) || authorId;
  const displayName = prop("displayName", space) || name;

  if (!source) return null;
  return (
    <React.Fragment>
      {(authorId && pageName) ? (
        <div className="spacer">
          <div className="titlebox">
            {userId ? null : (
              <React.Fragment>
                <h1 className="hover redditname">
                  <Link className="hover" href="">{displayName}</Link>
                </h1>
                {space ? (
                  <WikiPageContent name={`space:${space.name}:sidebar`} identifier={space.owner} />
                ) : (
                  <WikiPageContent name={`${pageName}:sidebar`} identifier={authorId} />
                )}
              </React.Fragment>
            )}
            <div className="bottom">
              {(ownerId !== indexer && pageName) ? (
                <React.Fragment>
                  owner: <UserIdLink userId={ownerId} />
                </React.Fragment>
              ) : null}
              {indexer ? (
                <React.Fragment>
                  indexer: <UserIdLink userId={indexer} />
                </React.Fragment>
              ) : null}
            </div>
            <div className="clear" />
          </div>
        </div>
      ) : null}
      <TopicList {...{ topics }} />
      <JavaScriptRequired silent>
        <SidebarUserList title="CURATORS" ids={curators} />
        <SidebarUserList title="CENSORS" ids={censors} />
        <div className="spacer">
          <div className="sidecontentbox">
            {isExpanded ? (
              <div className="title">
                {authorId && pageName ? (
                  <h1>
                    <Link href={`/user/${authorId}/pages/${pageName}`}>
                      listing source
                    </Link>
                  </h1>
                ) : (
                  <h1>listing source</h1>
                )}
              </div>
            ) : null}
            <div className={isExpanded ? "content" : ""}>
              {isExpanded && pageName && authorId ? (
                <WikiPageContent asSource name={pageName} identifier={authorId} />
              ) : null}
              <div className="more">
                <a href="" onClick={onToggle}>
                  {isExpanded
                    ? "...hide listing source..."
                    : "...show listing source..."}
                </a>
              </div>
            </div>
          </div>
        </div>
      </JavaScriptRequired>
    </React.Fragment>
  );
});
