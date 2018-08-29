import React from "react";
import { RegisterForm as SnewRegisterForm } from "snew-classic-ui";
import { injectState } from "freactal";
import { loginSignupProvider } from "./state";

export const RegisterForm = ({
  state: { notabugApi, username, password, passwordConfirm, passwordsMatch, signupError },
  effects: { onChangeUsername, onChangePassword, onChangePasswordConfirm, onSignup },
  ...props
}) => notabugApi.gun && notabugApi.gun.user ? (
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
) : null;

export default loginSignupProvider(injectState(RegisterForm));
