import React, { useState, useMemo, useCallback } from "react";
import { compose, trim, keysIn, prop } from "ramda";
import { Markdown } from "utils";
import { SidebarUserList } from "Auth/SidebarUserList";
import { parseListingSource } from "notabug-peer/listings";

export const ListingInfo = React.memo(({ source }) => {
  console.log({ source });
  const { lines, curators, censors } = useMemo(
    () => {
      const lines = source ? source.split("\n").map(compose(s => `    ${s}`, trim)) : [];
      const parsed = parseListingSource(source || "");
      const curators = keysIn(prop("curator", parsed));
      const censors = keysIn(prop("censor", parsed));
      return { lines, parsed, curators, censors };
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
      {curators.length ? <SidebarUserList title="CURATORS" ids={curators} /> : null}
      {censors.length ? <SidebarUserList title="CENSORS" ids={censors} /> : null}
      <div className="spacer">
        <div className="sidecontentbox">
          {isExpanded ? (
            <div className="title">
              <h1>listing source</h1>
            </div>
          ) : null}
          <div className="content">
            {isExpanded ? <Markdown body={lines.join("\n")} /> : null}
            <div className="more">
              <a href="" onClick={onToggle}>
                {isExpanded ? "...hide listing source..." : `...show listing source (${lines.length} lines)...`}
              </a>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});
