import React, { Fragment } from "react";
import LinkComponent from "./Link";
import AuthorLinkComponent from "./AuthorLink";

const UserInfo = ({
  Link = LinkComponent,
  AuthorLink = AuthorLinkComponent,
  subreddit = "reddit.com",
  loginUrl,
  signupUrl,
  prefsUrl,
  messagesUrl,
  logoutUrl,
  username,
  fullname,
  link_karma,
  onLogout
}) => username ? (
  <div id="header-bottom-right">
    <span className="user">
      <AuthorLink className="" author={username} author_fullname={fullname} />
      {link_karma ? (
        <Fragment>
          {"("}<span className="userkarma" title="post karma" >{link_karma}</span>{")"}
        </Fragment>
      ) : null}
    </span>
    {messagesUrl ? (
      <Fragment>
        <span className="separator">|</span>
        <Link
          className="nohavemail"
          href={messagesUrl}
          id="mail"
          title="no new mail"
        >
          messages
        </Link>
      </Fragment>
    ) : null}
    {prefsUrl ? (
      <Fragment>
        <span className="separator">|</span>
        <ul className="flat-list hover">
          <li>
            <Link className="pref-lang choice" href={prefsUrl}>
              preferences
            </Link>
          </li>
        </ul>
      </Fragment>
    ) : null}
    {onLogout || logoutUrl ? (
      <Fragment>
        <span className="separator">|</span>
        <form className="logout hover" >
          <input name="uh" type="hidden" defaultValue={username} />
          <input name="top" type="hidden" defaultValue="off" />
          <input name="dest" type="hidden" defaultValue={`/r/{subreddit}/`} />
          <a href={logoutUrl || ""} onClick={onLogout}>logout</a>
        </form>
      </Fragment>
    ) : null}
  </div>
) : loginUrl ? (
  <div id="header-bottom-right">
    {"Want to join ? "}
    <Link href={loginUrl} className="login-required login-link">Log in</Link>
    {" or "}
    <Link href={signupUrl || loginUrl} className="login-required">sign up</Link>
    {" in seconds."}
  </div>
) : null;

export default UserInfo;

