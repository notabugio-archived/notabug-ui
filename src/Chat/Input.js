import React, { PureComponent, Fragment } from "react";
import { injectState } from "freactal";
import isNode from "detect-node";
import { COMMENT_BODY_MAX } from "notabug-peer";

export class ChatInput extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { msg: "" };
  }

  render() {
    const user = this.props.state.notabugUser;
    const chatName = `t/${this.props.topic} public`;

    return (
      <form
        className="chat-input"
        onSubmit={this.onSend.bind(this)}
      >
        {isNode ? (
          <noscript>
            <input
              type="text"
              placeholder="chatting requires javascript"
              disabled
              readOnly
            />
            <button disabled className="send-btn" type="submit">send</button>
          </noscript>
        ) : (
          <Fragment>
            <input
              type="text"
              placeholder={`speaking as ${user ? user : "anon"} in ${chatName}`}
              value={this.state.msg}
              onChange={e => this.setState({ msg: e.target.value })}
            />
            <button className="send-btn" type="submit">send</button>
          </Fragment>
        )}
      </form>
    );
  }

  onSend(e) {
    e.preventDefault();
    if (!this.state.msg || !this.state.msg.trim() || this.state.msg.length > COMMENT_BODY_MAX) return;
    const body = this.state.msg;
    this.setState({ msg: "" });
    this.props.state.notabugApi.chat({
      topic: this.props.topic,
      body
    });
  }
}

export default injectState(ChatInput);
