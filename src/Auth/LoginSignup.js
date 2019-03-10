import React, { useState, useCallback } from "react";
import { Promise } from "notabug-peer";
import { useNotabug } from "NabContext";
import Spinner from "react-spinkit";
import { RegisterForm as SnewRegisterForm } from "snew-classic-ui";
import { LoginForm as SnewLoginForm } from "snew-classic-ui";
import { LoginFormSide as SnewLoginFormSide } from "snew-classic-ui";
import { Page } from "Page";
import { JavaScriptRequired } from "utils";
import { Markdown, injectHook } from "utils";

export const useLoginSignup = () => {
  const { me, api, history, hasLocalStorage } = useNotabug();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [signupError, setSignupError] = useState(null);
  const [rememberMe, onSetRememberMe] = useState(true);
  const passwordsMatch = password === passwordConfirm;
  const isSignupValid = password && passwordsMatch;
  const isLoginValid = username && password;
  const canLogin = !!(api && api.gun && api.gun.user);

  const onChangeUsername = useCallback(evt => {
    setUsername(evt.target.value);
  }, []);
  const onChangePassword = useCallback(evt => {
    setPassword(evt.target.value);
  }, []);
  const onChangePasswordConfirm = useCallback(evt => {
    setPasswordConfirm(evt.target.value);
  }, []);
  const onChangeRememberMe = useCallback(() => {
    onSetRememberMe(r => !r);
  }, []);

  const onLogin = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (isWorking) return Promise.reject("Already working");
      if (!isLoginValid) return Promise.reject("Invalid login input");
      setIsWorking(true);
      return api
        .login(username, password)
        .then(() => {
          setIsWorking(false);
          if (hasLocalStorage) {
            if (rememberMe) {
              localStorage.setItem("nabAlias", username);
              localStorage.setItem("nabPassword", password);
            } else {
              localStorage.setItem("nabAlias", "");
              localStorage.setItem("nabPassword", "");
            }
          }
        })
        .catch(loginError => {
          console.error("loginError", loginError.stack || loginError);
          setLoginError(loginError);
          setIsWorking(false);
          throw loginError;
        });
    },
    [isWorking, username, password]
  );

  const onSignup = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (isWorking) return Promise.reject("Already working");
      if (!isSignupValid) return Promise.resolve();
      setIsWorking(true);
      return Promise.resolve(api.signup(username, password))
        .then(() => {
          setIsWorking(false);
          if (hasLocalStorage) {
            if (rememberMe) {
              localStorage.setItem("nabAlias", username);
              localStorage.setItem("nabPassword", password);
            } else {
              localStorage.setItem("nabAlias", "");
              localStorage.setItem("nabPassword", "");
            }
          }
          history.replace("/");
        })
        .catch(signupError => {
          console.error("signupError", signupError.stack || signupError);
          setSignupError(signupError);
          setIsWorking(false);
          throw signupError;
        });
    },
    [isWorking, username, password, isSignupValid]
  );

  const onLoginAndRedirect = useCallback(
    evt => onLogin(evt).then(() => history.replace("/firehose")),
    [onLogin]
  );

  return {
    me,
    username,
    password,
    passwordConfirm,
    rememberMe,
    loginError,
    signupError,
    canLogin,
    isSignupValid,
    isLoginValid,
    isWorking,
    onChangeUsername,
    onChangePassword,
    onChangePasswordConfirm,
    onChangeRememberMe,
    onLogin,
    onLoginAndRedirect,
    onSignup
  };
};

export const RegisterForm = injectHook(useLoginSignup)(
  ({
    me,
    canLogin,
    username,
    password,
    passwordConfirm,
    passwordsMatch,
    signupError,
    onChangeUsername,
    onChangePassword,
    onChangePasswordConfirm,
    onSignup,
    isWorking,
    ...props
  }) => {
    if (!canLogin || me) return null;
    if (isWorking) return <Spinner fadeIn="none" name="ball-beat" color="#cee3f8" />;
    return (
      <SnewRegisterForm
        {...props}
        formAction={null}
        username={username}
        usernameError={
          signupError || (username ? null : "Username is required")
        }
        passwd={password}
        passwd2={passwordConfirm}
        passwd2Error={
          !passwordsMatch || !password ? null : "Passwords don't match"
        }
        buttonText="create a new identity"
        rememberMeText="remember me (stores password in browser localStorage)"
        usernamePlaceholder="choose an alias"
        onChangeUsername={onChangeUsername}
        onChangePasswd={onChangePassword}
        onChangePasswd2={onChangePasswordConfirm}
        onSignUp={onSignup}
      />
    );
  }
);

export const LoginForm = injectHook(useLoginSignup)(
  ({
    me,
    username,
    password,
    loginError,
    canLogin,
    onChangeUsername,
    onChangePassword,
    onLoginAndRedirect,
    isWorking,
    ...props
  }) => {
    if (!canLogin || me) return null;
    if (isWorking) return <Spinner fadeIn="none" name="ball-beat" color="#cee3f8" />;
    return (
      <SnewLoginForm
        {...props}
        formAction={null}
        username={username}
        passwd={password}
        passwdError={loginError}
        usernamePlaceholder="alias"
        onChangeUsername={onChangeUsername}
        onChangePasswd={onChangePassword}
        onLogin={onLoginAndRedirect}
      />
    );
  }
);

export const LoginFormSide = injectHook(useLoginSignup)(
  ({
    me,
    username,
    password,
    loginError,
    canLogin,
    onChangeUsername,
    onChangePassword,
    onLogin,
    isWorking,
    ...props
  }) => {
    if (!canLogin || me) return null;
    if (isWorking) return <Spinner fadeIn="none" name="ball-beat" color="#cee3f8" />;
    return (
      <SnewLoginFormSide
        {...props}
        formAction={null}
        username={username}
        passwd={password}
        passwdError={loginError}
        usernamePlaceholder="alias"
        onChangeUsername={onChangeUsername}
        onChangePasswd={onChangePassword}
        onLogin={e => {
          e.preventDefault();
          onLogin();
        }}
      />
    );
  }
);

export const LoginSignupPage = () => (
  <Page hideLogin>
    <JavaScriptRequired>
      <div id="login">
        <div className="split-panel">
          <div className="split-panel-section split-panel-divider">
            <Markdown
              body={`
# Welcome to Notabug

Identities on nab are cryptographic keys owned by you.

They enable additional features, but you can participate without one.

These features include an inbox and profile to showcase your content.

More customization and community features coming soon


              `}
            />
          </div>
          <div className="split-panel-section">
            <RegisterForm />
          </div>
        </div>
      </div>
      <center>
        <Markdown
          body={`

---

Give me your tired, your poor,
Your huddled masses yearning to breathe free,
The wretched refuse of your teeming shore.
Send these, the homeless, tempest-tossed to me,
I lift my lamp beside the golden door!
          `}
        />
      </center>
    </JavaScriptRequired>
  </Page>
);
