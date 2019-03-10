import React from "react";
import RegisterFormComponent from "./RegisterForm";
import LoginFormComponent from "./LoginForm";
import LinkComponent from "./Link";

const LoginSignupPage = ({
  Link = LinkComponent,
  LoginForm = LoginFormComponent,
  RegisterForm = RegisterFormComponent
}) => (
  <div className="content" role="main">
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
      {/* <p className="login-disclaimer">
        By signing up, you agree to our{" "}
        <a href="/help/useragreement/">Terms</a> and that you
        have read our{" "}
        <a href="/help/privacypolicy/">Privacy Policy</a> and{" "}
        <a href="/help/contentpolicy/">Content Policy</a>.
      </p>*/}
    </div>
  </div>
);

export default LoginSignupPage;
