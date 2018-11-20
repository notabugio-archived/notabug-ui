import React, { useState, useMemo, useCallback } from "react";
import { compose, trim, keysIn, prop } from "ramda";
import { Markdown } from "utils";
import { SidebarUserList } from "Auth/SidebarUserList";
import { TopicList } from "Page/TopicList";
import { parseListingSource } from "notabug-peer/listings";

export const ListingInfo = React.memo(({ source }) => {
  console.log({ source });
  const { lines, curators, censors, topics } = useMemo(
    () => {
      const lines = source
        ? source.split("\n").map(
            compose(
              s => `    ${s}`,
              trim
            )
          )
        : [];
      const parsed = parseListingSource(source || "");
      const curators = keysIn(prop("curator", parsed));
      const censors = keysIn(prop("censor", parsed));
      const topics = keysIn(prop("topic", parsed));
      return { lines, parsed, curators, censors, topics };
    },
    [source]
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const onToggle = useCallback(evt => {
    evt && evt.preventDefault();
    setIsExpanded(ex => !ex);
  }, []);

  if (!source) return null;
  return (
    <React.Fragment>
      <TopicList {...{ topics }} />
      <SidebarUserList title="CURATORS" ids={curators} />
      <SidebarUserList title="CENSORS" ids={censors} />
      <div className="spacer">
        <div className="sidecontentbox">
          {isExpanded ? (
            <div className="title">
              <h1>listing source</h1>
            </div>
          ) : null}
          <div className={isExpanded ? "content" : ""}>
            {isExpanded ? <Markdown body={lines.join("\n")} /> : null}
            <div className="more">
              <a href="" onClick={onToggle}>
                {isExpanded
                  ? "...hide listing source..."
                  : `...show listing source (${lines.length} lines)...`}
              </a>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});
