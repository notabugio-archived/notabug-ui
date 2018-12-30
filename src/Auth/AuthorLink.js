import React from "react";
import { Identicon } from "./Identicon";
import { Link, ErrorBoundary } from "utils";
import { Tooltip } from "react-tippy";

export const AuthorLink = ({
  className="author may-blank",
  iconSize=16,
  author,
  author_fullname
}) => (author && author_fullname) ? (
  <ErrorBoundary>
    <Tooltip
      followCursor
      title={author}
      html={(
        <h1 className="user-hover-info">
          <Identicon size={48} {...{ author, author_fullname }} />
          {author}
        </h1>
      )}
    >
      <Link href={`/user/${author_fullname}`} className={className}>
        <Identicon size={iconSize} {...{ author, author_fullname }} />
        {author.length > 20 ? `${author.slice(0, 20)}...` : author}
      </Link>
    </Tooltip>
  </ErrorBoundary>
) : null;
