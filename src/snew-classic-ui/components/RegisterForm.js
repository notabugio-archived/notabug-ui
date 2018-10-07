import React from "react";

const RegisterForm = ({
  formAction="/post/reg",
  username,
  usernameError,
  passwd,
  passwdError,
  passwd2,
  passwd2Error,
  email,
  rememberMe=false,
  onChangeUsername,
  onChangePasswd,
  onChangePasswd2,
  onChangeEmail,
  onChangeRememberMe,
  onSignUp
}) => (
  <form
    action={formAction}
    className="form-v2"
    id="register-form"
    method="post"
    name="register-form"
    onSubmit={onSignUp}
  >
    <input name="op" type="hidden" defaultValue="reg" />
    <input
      name="dest"
      type="hidden"
      defaultValue="/"
    />
    <div className="c-form-group">
      <label className="screenreader-only" htmlFor="user_reg">
        username:
      </label>
      <input
        autoComplete="off"
        className="c-form-control"
        data-validate-min={3}
        data-validate-url="/api/check_username.json"
        id="user_reg"
        maxLength={20}
        name="user"
        placeholder="choose a username"
        tabIndex={2}
        type="text"
        defaultValue={username}
        onChange={e => onChangeUsername(e.target.value)}
      />
      <div className="c-form-control-feedback-wrapper">
        {usernameError
          ? <span className="c-form-control-feedback c-form-control-feedback-error" title={usernameError}  style={{ display: "block" }} />
          : null}
      </div>
    </div>
    <div className="c-form-group">
      <label className="screenreader-only" htmlFor="passwd_reg">
        password:
      </label>
      <input
        className="c-form-control"
        data-validate-url="/api/check_password.json"
        id="passwd_reg"
        name="passwd"
        placeholder="password"
        tabIndex={2}
        type="password"
        defaultValue={passwd}
        onChange={e => onChangePasswd(e.target.value)}
      />
      <div className="c-form-control-feedback-wrapper">
        {passwdError
          ? <span className="c-form-control-feedback c-form-control-feedback-error" title={passwdError} style={{ display: "block" }} />
          : null}
      </div>
    </div>
    <div className="c-form-group">
      <label className="screenreader-only" htmlFor="passwd2_reg">
        verify password:
      </label>
      <input
        className="c-form-control"
        id="passwd2_reg"
        name="passwd2"
        placeholder="verify password"
        tabIndex={2}
        type="password"
        defaultValue={passwd2}
        onChange={e => onChangePasswd2(e.target.value)}
      />
      <div className="c-form-control-feedback-wrapper">
        {passwd2Error
          ? <span className="c-form-control-feedback c-form-control-feedback-error" title={passwd2Error} style={{ display: "block" }} />
          : null}
      </div>
    </div>
    {onChangeEmail ? (
      <div className="c-form-group">
        <label className="screenreader-only" htmlFor="email_reg">
          email: <i>(optional)</i>
        </label>
        <input
          className="c-form-control"
          data-validate-on="change blur"
          data-validate-url="/api/check_email.json"
          id="email_reg"
          name="email"
          placeholder="email (optional)"
          tabIndex={2}
          defaultValue={email}
          onChange={e => onChangeEmail(e.target.value)}
          type="text"
        />
        <div className="c-form-control-feedback-wrapper" />
      </div>
    ) : null}
    {onChangeRememberMe ? (
      <div className="c-checkbox">
        <input
          id="rem_reg"
          name="rem"
          tabIndex={2}
          type="checkbox"
          checked={rememberMe}
          onChange={e => onChangeRememberMe(e.target.checked)}
        />
        <label htmlFor="rem_reg">remember me</label>
      </div>
    ) : null}
    <div className="c-clearfix c-submit-group">
      <button
        className="c-btn c-btn-primary c-pull-right"
        tabIndex={2}
        onClick={onSignUp}
      >
        sign up
      </button>
    </div>
    <div>
      <div className="c-alert c-alert-danger" />
    </div>
  </form>
);

export default RegisterForm;
