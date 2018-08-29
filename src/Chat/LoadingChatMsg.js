import React from "react";
import Spinner from "react-spinkit";
import { ChatMsg } from "./ChatMsg";

export const LoadingChatMsg = props => (
  <ChatMsg
    {...props}
    item={{ body: "loading...", }}
    Markdown={() => (
      <div className="usertext-body may-blank-within md-container">
        <div className="md">
          <Spinner
            name="ball-beat"
            color="#cee3f8"
          />
          <div className="clearleft" />
        </div>
      </div>
    )}
  />
);
