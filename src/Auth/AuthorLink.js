import React from "react";
import { assocPath } from "ramda";
import { Identicon } from "./Identicon";
import { Link, ErrorBoundary } from "utils";
import TooltipTrigger from "react-popper-tooltip";

export const AuthorLink = ({
  className="author may-blank",
  iconSize=16,
  author,
  author_fullname
}) => (author && author_fullname) ? (
  <ErrorBoundary>
    <TooltipTrigger
      followCursor
      tooltip={({ tooltipRef, getTooltipProps  }) => (
        <div {...assocPath(
          ["style", "opacity"],
          1, // WTF is this stuck at 0 without this?
          getTooltipProps({ ref: tooltipRef, className: "tooltip-container" })
        )}>
          <h1 className="user-hover-info">
            <Identicon size={48} {...{ author, author_fullname }} />
            {author}
          </h1>
        </div>
      )}
    >
      {({ getTriggerProps, triggerRef }) => (
        <Link
          href={`/user/${author_fullname}`}
          {...getTriggerProps({ ref: triggerRef, className })}
          className={className}
        >
          <Identicon size={iconSize} {...{ author, author_fullname }} />
          {author.length > 20 ? `${author.slice(0, 20)}...` : author}
        </Link>
      )}
    </TooltipTrigger>
  </ErrorBoundary>
) : null;
