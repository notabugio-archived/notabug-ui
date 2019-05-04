import React, { forwardRef } from "react";
import { Identicon } from "./Identicon";
import { Link, ErrorBoundary } from "/utils";
import Tippy from "@tippy.js/react";

const AuthorTooltip = forwardRef(({ author, author_fullname }, ref) => (
  <div>
    <h1 className="user-hover-info">
      <Identicon size={48} {...{ author, author_fullname }} />
      {author}
    </h1>
  </div>
));

export const AuthorLinkWithoutToolTip = forwardRef(
  (
    { className = "author may-blank", iconSize = 16, author, author_fullname },
    ref
  ) =>
    author && author_fullname ? (
      <ErrorBoundary>
        <Link href={`/user/${author_fullname}`} className={className}>
          <span ref={ref}>
            <Identicon size={iconSize} {...{ author, author_fullname }} />
            {author.length > 20 ? `${author.slice(0, 20)}...` : author}
          </span>
        </Link>
      </ErrorBoundary>
    ) : null
);

export const AuthorLinkWithToolTip = ({
  className = "author may-blank",
  iconSize = 16,
  ...props
}) =>
  props.author && props.author_fullname ? (
    <ErrorBoundary>
      <Tippy content={<AuthorTooltip {...props} />}>
        <AuthorLinkWithoutToolTip {...props} />
      </Tippy>
    </ErrorBoundary>
  ) : null;

export const AuthorLink = AuthorLinkWithToolTip;
