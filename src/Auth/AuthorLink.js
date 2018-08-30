import React from "react";
import { Identicon } from "./Identicon";
import { Link } from "utils";

export const AuthorLink = ({
  className="author may-blank",
  author,
  author_fullname
}) => author ? (
  <Link href={`/user/~${author_fullname}`} className={className}>
    <Identicon size={16} {...{ author, author_fullname }} />
    {author}
  </Link>
) : null;
