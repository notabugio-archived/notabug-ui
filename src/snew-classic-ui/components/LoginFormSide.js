import React, { Fragment } from "react";
import LinkComponent from "./Link";

const LoginFormSide = ({
  Link = LinkComponent,
  formAction="/post/login",
  username,
  passwd,
  passwdError,
  rememberMe,
  resetPasswordUrl,
  usernamePlaceholder="username",
  onChangeRememberMe,
  onChangeUsername,
  onChangePasswd,
  onLogin
}) => (
  <div className="spacer">
    <form
      action={formAction}
      className="login-form login-form-side"
      id="login_login-main"
      method="post"
      onSubmit={onLogin}
    >
      <input name="op" type="hidden" defaultValue="login-main" />
      <input
        maxLength={20}
        name="user"
        placeholder={usernamePlaceholder}
        tabIndex={1}
        type="text"
        defaultValue={username}
        onChange={onChangeUsername}
      />
      <input
        name="passwd"
        placeholder="password"
        tabIndex={1}
        type="password"
        defaultValue={passwd}
        onChange={onChangePasswd}
      />
      {passwdError ? (
        <div className="status error" style={{ display: "block" }} >
          {passwdError}
        </div>
      ) : null}
      <div className="status" />
      {(onChangeRememberMe || resetPasswordUrl) ? (
        <div id="remember-me">
          {onChangeRememberMe ? (
            <Fragment>
              <input
                id="rem-login-main"
                name="rem"
                tabIndex={1}
                type="checkbox"
                checked={rememberMe}
                onChange={onChangeRememberMe}
              />
              <label htmlFor="rem-login-main">remember me</label>
            </Fragment>
          ) : null}
          {resetPasswordUrl ? (
            <Link className="recover-password" href={resetPasswordUrl}>
              reset password
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="submit">
        <button className="btn" tabIndex={1} type="submit">
          login
        </button>
      </div>
      <div className="clear" />
    </form>
  </div>
);

export default LoginFormSide;

