import React, { Fragment } from "react";
import {
  LoginSignupPage as SnewLoginSignupPage,
  LoginForm as SnewLoginForm,
  LoginFormSide as SnewLoginFormSide,
  RegisterForm as SnewRegisterForm
} from "snew-classic-ui";
import { Header as SnewHeader } from "snew-classic-ui";
import { JavaScriptRequired } from "./JavaScriptRequired";
import { Link } from "./Link";
import { notabugLoginSignupForm } from "state/notabug";
import { injectState } from "freactal";

const AlphaWarning = () => (
  <div className="reddit-infobar with-icon locked-infobar">
    <h3>auth is <strong>alpha</strong>, may take multiple tries</h3>
    <p>password changes are not yet possible</p>
  </div>
);

const LoginForm = notabugLoginSignupForm(injectState(({
  state: { notabugApi, username, password, loginError },
  effects: { onChangeUsername, onChangePassword, onLoginAndRedirect },
  ...props
}) => notabugApi.gun && notabugApi.gun.user ? (
  <Fragment>
    <SnewLoginForm
      {...props}
      formAction={null}
      username={username}
      passwd={password}
      passwdError={loginError}
      onChangeUsername={onChangeUsername}
      onChangePasswd={onChangePassword}
      onLogin={e => {
        e.preventDefault();
        onLoginAndRedirect();
      }}
    />
  </Fragment>
) : null));

export const LoginFormSide = notabugLoginSignupForm(injectState(({
  state: { notabugApi, notabugUsername, username, password, loginError },
  effects: { onChangeUsername, onChangePassword, onLogin },
  ...props
}) => notabugApi.gun && notabugApi.gun.user ? (
  <Fragment>
    <SnewLoginFormSide
      {...props}
      formAction={null}
      username={username}
      passwd={password}
      passwdError={loginError}
      onChangeUsername={onChangeUsername}
      onChangePasswd={onChangePassword}
      onLogin={e => {
        e.preventDefault();
        onLogin();
      }}
    />
  </Fragment>
) : null));

const RegisterForm = notabugLoginSignupForm(injectState(({
  state: { notabugApi, username, password, passwordConfirm, passwordsMatch, signupError },
  effects: { onChangeUsername, onChangePassword, onChangePasswordConfirm, onSignup },
  ...props
}) => notabugApi.gun && notabugApi.gun.user ? (
  <Fragment>
    <SnewRegisterForm
      {...props}
      formAction={null}
      username={username}
      usernameError={signupError || (username ? null : "Username is required")}
      passwd={password}
      passwd2={passwordConfirm}
      passwd2Error={(passwordsMatch || !password) ? null : "Passwords don't match"}
      onChangeUsername={onChangeUsername}
      onChangePasswd={onChangePassword}
      onChangePasswd2={onChangePasswordConfirm}
      onSignUp={e => {
        e.preventDefault();
        onSignup();
      }}
    />
  </Fragment>
) : null));


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
