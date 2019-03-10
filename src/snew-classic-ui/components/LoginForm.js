import React, { Fragment } from "react";
import LinkComponent from "./Link";

const LoginForm = ({
  Link = LinkComponent,
  formAction = "/post/login",
  username,
  usernameError,
  passwd,
  passwdError,
  rememberMe,
  usernamePlaceholder = "username",
  resetPasswordUrl,
  onChangeRememberMe,
  onChangeUsername,
  onChangePasswd,
  onLogin
}) => (
  <form
    action={formAction}
    className="form-v2"
    id="login-form"
    method="post"
    name="login-form"
    onSubmit={onLogin}
  >
    <input name="op" type="hidden" defaultValue="login" />
    <input name="dest" type="hidden" defaultValue="/" />
    <div className="c-form-group">
      <label className="screenreader-only" htmlFor="user_login">
        {usernamePlaceholder}:
      </label>
      <input
        autoFocus
        className="c-form-control"
        id="user_login"
        maxLength={20}
        name="user"
        placeholder={usernamePlaceholder}
        tabIndex={3}
        type="text"
        defaultValue={username}
        onChange={onChangeUsername}
      />
      <div className="c-form-control-feedback-wrapper">
        {usernameError ? (
          <span
            className="c-form-control-feedback c-form-control-feedback-error"
            title={usernameError}
            style={{ display: "block" }}
          />
        ) : null}
      </div>
    </div>
    <div className="c-form-group">
      <label className="screenreader-only" htmlFor="passwd_login">
        password:
      </label>
      <input
        className="c-form-control"
        id="passwd_login"
        name="passwd"
        placeholder="password"
        tabIndex={3}
        type="password"
        defaultValue={passwd}
        onChange={onChangePasswd}
      />
      <div className="c-form-control-feedback-wrapper">
        {passwdError ? (
          <span
            className="c-form-control-feedback c-form-control-feedback-error"
            title={passwdError}
            style={{ display: "block" }}
          />
        ) : null}
      </div>
    </div>
    {onChangeRememberMe || resetPasswordUrl ? (
      <div className="c-checkbox">
        {onChangeRememberMe ? (
          <Fragment>
            <input
              id="rem_login"
              name="rem"
              tabIndex={3}
              type="checkbox"
              checked={rememberMe}
              onChange={onChangeRememberMe}
            />
            <label htmlFor="rem_login">remember me</label>
          </Fragment>
        ) : null}
        {resetPasswordUrl ? (
          <Link className="c-pull-right" href={resetPasswordUrl}>
            reset password
          </Link>
        ) : null}
      </div>
    ) : null}
    <div className="c-clearfix c-submit-group">
      <button
        className="c-btn c-btn-primary c-pull-right"
        tabIndex={3}
        type="submit"
      >
        log in
      </button>
    </div>
    <div>
      <div className="c-alert c-alert-danger" />
    </div>
  </form>
);

export default LoginForm;
