import React, { PureComponent } from "react";
import { Listing } from "./Listing";
import { injectState } from "freactal";

class ChatBase extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      msg: "",
      topic: props.topic || "whatever",
      isOpen: false
    };
  }

  render() {
    const user = this.props.state.notabugUser;
    const chatName = `t/${this.state.topic} public`;

    return this.state.isOpen ? (
      <div
        style={{
          position: "fixed",
          backgroundColor: "#EFF7FF",
          borderLeft: "1px solid #5f99cf",
          borderTop: "1px solid #5f99cf",
          right: 0,
          bottom: 0,
          width: "560px",
          height: "380px"
        }}
      >
        <div
          style={{
            position: "absolute",
            display: "block",
            left: 0,
            right: 0,
            top: "28px",
            paddingTop: "0.5em",
            bottom: "1em",
            overflowY: "scroll"
          }}
        >
          <Listing
            Empty={() => "No Messages Yet"}
            sort={"new"}
            topics={[`chat:${this.state.topic}`]}
            days={2}
            //threshold={-1}
            limit={250}
          />
        </div>
        <button
          style={{
            position: "absolute",
            backgroundColor: "#cee3f8",
            borderColor: "#5f99cf",
            bottom: 0,
            right: 0
          }}
          onClick={() => this.setState({ isOpen: false })}
        >close chat</button>
        <form
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0
          }}
          onSubmit={this.onSend.bind(this)}
        >
          <input
            type="text"
            placeholder={`speaking as ${user ? user : "anon"} in ${chatName}`}
            value={this.state.msg}
            style={{ width: "100%", padding: "0.5em" }}
            onChange={e => this.setState({ msg: e.target.value })}
          />
        </form>
      </div>
    ) : (
      <button
        style={{
          position: "fixed",
          right: 0,
          bottom: 0,
          backgroundColor: "#cee3f8",
          borderColor: "#5f99cf"
        }}
        onClick={() => this.setState({ isOpen: true })}
      >
        open chat
      </button>
    );
  }

  onSend(e) {
    e.preventDefault();
    if (!this.state.msg || !this.state.msg.trim()) return;
    const body = this.state.msg;
    this.setState({ msg: "" });
    this.props.state.notabugApi.chat({
      topic: this.state.topic,
      body
    });
  }
}

export const Chat = injectState(ChatBase);
