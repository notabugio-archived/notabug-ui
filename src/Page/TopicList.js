import React, { useState, useCallback } from "react";
import { Link, JavaScriptRequired } from "utils";

export const TopicList = React.memo(({ topics }) => {
  if (!topics || topics.length <= 1) return null;
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = useCallback(evt => {
    evt && evt.preventDefault();
    setOpen(open => !open);
  }, []);

  return (
    <JavaScriptRequired silent>
      <div className="spacer">
        <div className="sidecontentbox">
          {isOpen ? (
            <div className="title">
              <h1>{topics.length} topics</h1>
            </div>
          ) : null}
          <ul className={isOpen ? "content" : ""}>
            {isOpen ? topics.map(topic => (
              <li>
                <Link href={`/t/${topic}`}>{topic}</Link>
              </li>
            )) : null}
            <li className="more">
              <a href="" onClick={toggleOpen}>
                ...{isOpen ? "hide" : "show"} {topics.length} topics...
              </a>
            </li>
          </ul>
        </div>
      </div>
    </JavaScriptRequired>
  );
});
