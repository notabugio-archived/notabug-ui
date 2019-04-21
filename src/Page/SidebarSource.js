import React from "react";
import { WikiPageContent } from "/Wiki";
import { JavaScriptRequired, Link, useToggle } from "/utils";

export const SidebarSource = ({ name, identifier }) => {
  const [isSourceExpanded, onToggleSourceExpanded] = useToggle(false);

  if (!name || !identifier) return null;
  const path = `/user/${identifier}/pages/${name}`;

  return (
    <JavaScriptRequired silent>
      <div className="spacer">
        <div className="sidecontentbox">
          {isSourceExpanded ? (
            <div className="title">
              <h1>
                <Link href={path}>listing source</Link>
              </h1>
            </div>
          ) : null}
          <div className={isSourceExpanded ? "content" : ""}>
            {isSourceExpanded ? (
              <WikiPageContent asSource {...{ name, identifier }} />
            ) : null}
            <div className="more">
              <a href={path} onClick={onToggleSourceExpanded}>
                ...{isSourceExpanded ? "hide" : "show"} listing source...
              </a>
            </div>
          </div>
        </div>
      </div>
    </JavaScriptRequired>
  );
};
