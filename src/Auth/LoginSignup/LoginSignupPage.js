import React, { Fragment } from "react";
import { LoginSignupPage as SnewLoginSignupPage, Header as SnewHeader } from "snew-classic-ui";
import { Link, JavaScriptRequired } from "utils";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export const LoginSignupPage = props => (
  <Fragment>
    <Header />
    <JavaScriptRequired>
      <center><AlphaWarning /></center>
      <SnewLoginSignupPage
        {...props}
        LoginForm={LoginForm}
        RegisterForm={RegisterForm}
      />
      <center><AlphaWarning /></center>
    </JavaScriptRequired>
  </Fragment>
);

const AlphaWarning = () => (
  <div className="reddit-infobar with-icon locked-infobar">
    <h3>auth is <strong>alpha</strong>, may take multiple tries</h3>
    <p>password changes are not yet possible</p>
  </div>
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

export default LoginSignupPage;
