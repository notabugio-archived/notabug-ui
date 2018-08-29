import React from "react";
import { LoginForm as SnewLoginForm } from "snew-classic-ui";
import { injectState } from "freactal";
import { loginSignupProvider } from "./state";

export const LoginForm = (({
  state: { notabugApi, username, password, loginError },
  effects: { onChangeUsername, onChangePassword, onLoginAndRedirect },
  ...props
}) => notabugApi.gun && notabugApi.gun.user ? (
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
) : null);

export default loginSignupProvider(injectState(LoginForm));
