import React, { PureComponent } from "react";
import Spinner from "react-spinkit";
import { ChatMsg } from "./ChatMsg";
import { injectState } from "freactal";

class LoadingChatMsgBase extends PureComponent {
  render() {
    return (
      <ChatMsg
        {...this.props}
        item={{
          body: "loading...",
          timestamp: this.props.state.notabugApi.getTimestamp(this.props.id)
        }}
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
  }
}

export const LoadingChatMsg = injectState(LoadingChatMsgBase);
