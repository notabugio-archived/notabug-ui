import React, { Fragment } from "react";
import ProfileHeaderComponent from "./ProfileHeader";
import FooterParentComponent from "./FooterParent";
import LoginFormSideComponent from "./LoginFormSide";
import LinkComponent from "./Link";
import { optional } from "../util";

export const ProfilePage = ({
  ProfileHeader = ProfileHeaderComponent,
  FooterParent = FooterParentComponent,
  Link = LinkComponent,
  Timestamp = ({ created }) => created,
  LoginFormSide = LoginFormSideComponent,
  username,
  profileuser_username,
  afterTitlebox,
  post_karma=null,
  comment_karma=null,
  sendMsgUrl,
  created,
  created_utc,
  userlabel="redditor for",
  karmaname="karma",
  children,
  ...props
}) => (
  <Fragment>
    {optional(ProfileHeader, { ...props, Link, profileuser_username, key: "header" })}
    <div className="side">
      <div className="spacer">
        <div className="titlebox">
          <h1>{profileuser_username}</h1>
          {post_karma === null ? null : (
            <Fragment><span className="karma">{post_karma}</span> post {karmaname}<br /></Fragment>
          )}
          {comment_karma === null ? null : (
            <Fragment>
              <span className="karma comment-karma">{comment_karma}</span> comment {karmaname}<br />
            </Fragment>
          )}
          <div className="bottom">
            {sendMsgUrl ? (
              <Link href={sendMsgUrl} className="access-required" data-type="account" data-event-action="compose">
                send a private message
              </Link>
            ) : null}
            {(created || created_utc) ? (
              <span className="age">
                {userlabel} <Timestamp {...{ created, created_utc }} />
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {afterTitlebox || null}
      {username ? null : optional(LoginFormSide, props)}
    </div>
    <a name="content" />
    {children || null}
    {optional(FooterParent, { ...props, key: "footer" })}
    <img id="hsts_pixel" key="hsts_pixel" />
    <p className="bottommenu debuginfo" key="debuginfo">
      <span className="icon">π</span> <span className="content">
        Rendered by go1dfish on open-source-reddit at 2017-10-22 02:55:43.787032+00:00
        running 753b174 .
      </span>
    </p>
  </Fragment>
);

export default ProfilePage;
