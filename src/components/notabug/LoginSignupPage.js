import React, { Fragment } from "react";
import { LoginSignupPage as SnewLoginSignupPage } from "snew-classic-ui";
import { Header as SnewHeader } from "snew-classic-ui";
import { Link } from "./Link";

export const LoginSignupPage = (props) => (
  <Fragment>
    <Header />
    <h2>Note this page doesn't work yet, don't bother trying</h2>
    <SnewLoginSignupPage {...props} />
  </Fragment>
);

const Header = (props) => (
  <SnewHeader
    UserInfo={() => null}
    SrHeaderArea={() => null}
    HeaderBottomLeft={HeaderBottomLeft}
    {...props}
  />
);

const HeaderBottomLeft = () => (
  <div id="header-bottom-left">
    <Link href="/" className="default-header" id="header-img">
      notabug
    </Link>
    <span className="pagename selected">sign up or log in</span>
  </div>
);
