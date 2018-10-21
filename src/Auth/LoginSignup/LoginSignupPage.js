import React from "react";
import { Page } from "Page";
import { JavaScriptRequired } from "utils";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export const LoginSignupPage = () => (
  <Page hideLogin>
    <JavaScriptRequired>
      <center><AlphaWarning /></center>
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

const AlphaWarning = () => (
  <div className="reddit-infobar with-icon locked-infobar">
    <h3>auth is <strong>alpha</strong>, may take multiple tries</h3>
    <p>password changes are not yet possible</p>
  </div>
);

export default LoginSignupPage;
