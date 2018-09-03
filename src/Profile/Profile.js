import React, { Fragment } from "react";
import { injectState } from "freactal";
import { withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ProfilePage } from "snew-classic-ui";
import { Link, Timestamp } from "utils";
import { UserInfo, LoginFormSide, AuthorLink } from "Auth";
import { ProfilePublicLenses } from "Lenses";
import { NavTab } from "./NavTab";
import { userProfileProvider } from "./state";

export const Profile = ({
  state: { notabugUser, profileUserName, profileUserId, profileCreatedAt },
  children
}) => (
  <ProfilePage
    Link={Link}
    NavTab={NavTab}
    SrHeaderArea={() => null}
    Timestamp={Timestamp}
    FooterParent={() => null}
    UserInfo={UserInfo}
    LoginFormSide={LoginFormSide}
    username={notabugUser}
    created_utc={profileCreatedAt/1000}
    userlabel="created"
    karmaname="points"
    profileuser_username={(
      <AuthorLink
        className=""
        author={profileUserName}
        author_fullname={profileUserId.slice(1)}
      />
    )}
    profileuser_fullname={profileUserId}
    afterTitlebox={(
      <Fragment>
        <ProfilePublicLenses userId={profileUserId} />
      </Fragment>
    )}
  >
    <Helmet><body class="listing-page profile-page" /></Helmet>
    {children}
  </ProfilePage>
);

export default withRouter(userProfileProvider(injectState(Profile)));
