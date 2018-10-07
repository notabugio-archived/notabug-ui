import React from "react";
import LinkComponent from "./Link";

const AuthorLink = ({
  className="author may-blank",
  Link=LinkComponent,
  author
}) => (
  <Link href={`/user/${author}`} className={className}>{author}</Link>
);

export default AuthorLink;
