import React, { useState, useCallback, useContext } from "react";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { NabContext } from "NabContext";
import Spinner from "react-spinkit";
import { RegisterForm as SnewRegisterForm } from "snew-classic-ui";
import { LoginForm as SnewLoginForm } from "snew-classic-ui";
import { LoginFormSide as SnewLoginFormSide } from "snew-classic-ui";
import { Page } from "Page";
import { JavaScriptRequired } from "utils";
import { injectHook } from "utils";

export const useLoginSignup = () => {
  const { me, api, history } = useContext(NabContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [signupError, setSignupError] = useState(null);
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

  const onLogin = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (isWorking) return Promise.reject("Already working");
      if (!isLoginValid) return Promise.reject("Invalid login input");
      setIsWorking(true);
      return api
        .login(username, password)
        .then(() => setIsWorking(false))
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
    loginError,
    signupError,
    canLogin,
    isSignupValid,
    isLoginValid,
    isWorking,
    onChangeUsername,
    onChangePassword,
    onChangePasswordConfirm,
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
    if (isWorking) return <Spinner name="ball-beat" color="#cee3f8" />;
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
    if (isWorking) return <Spinner name="ball-beat" color="#cee3f8" />;
    return (
      <SnewLoginForm
        {...props}
        formAction={null}
        username={username}
        passwd={password}
        passwdError={loginError}
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
    if (isWorking) return <Spinner name="ball-beat" color="#cee3f8" />;
    return (
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
    );
  }
);

export const LoginSignupPage = () => (
  <Page hideLogin>
    <JavaScriptRequired>
      <center>
        <div className="reddit-infobar with-icon locked-infobar">
          <h3>
            auth is <strong>alpha</strong>, may take multiple tries
          </h3>
          <p>Password manager with random password highly recommended</p>
          <p>DO NOT REUSE EXISING PASSWORDS FROM OTHER SITES</p>
        </div>
      </center>
      <div id="login">
        <div className="split-panel">
          <div className="split-panel-section split-panel-divider">
            <h4 className="modal-title">create a new account</h4>
            <RegisterForm />
          </div>
          <div className="split-panel-section">
            <h4 className="modal-title">log in</h4>
            <LoginForm />
          </div>
        </div>
      </div>
    </JavaScriptRequired>
  </Page>
);
