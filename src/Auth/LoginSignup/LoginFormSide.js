import React from "react";
import { LoginFormSide as SnewLoginFormSide } from "snew-classic-ui";
import { injectState } from "freactal";
import { loginSignupProvider } from "./state";

export const LoginFormSide = ({
  state: { notabugApi, username, password, loginError },
  effects: { onChangeUsername, onChangePassword, onLogin },
  ...props
}) => notabugApi.gun && notabugApi.gun.user ? (
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
) : null;

export default loginSignupProvider(injectState(LoginFormSide));
