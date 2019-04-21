import React from "react";
import { Spinner } from "/utils/Spinner";
import { ChatMsg } from "./ChatMsg";

export const LoadingChatMsg = props => (
  <ChatMsg
    {...props}
    Markdown={() => (
      <div className="usertext-body may-blank-within md-container">
        <div className="md">
          <Spinner name="ball-beat" color="#cee3f8" />
          <div className="clearleft" />
        </div>
      </div>
    )}
  />
);
