import Promise from "promise";
import React, { PureComponent, Fragment } from "react";
import debounce from "lodash/debounce";
import { withRouter } from "react-router-dom";
import { Header } from "snew-classic-ui";
import { NavTab } from "./NavTab";
import { UserInfo } from "./UserInfo";
import { Link } from "./Link";
import { Listing } from "./Listing";
import { injectState } from "freactal";
import ChatView from "react-chatview";
import { Loading } from "./Loading";

class ChatInputBase extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      msg: "",
    };
  }

  render() {
    const user = this.props.state.notabugUser;
    const chatName = `t/${this.props.topic} public`;

    return (
      <form
        className="chat-input"
        onSubmit={this.onSend.bind(this)}
      >
        <input
          type="text"
          placeholder={`speaking as ${user ? user : "anon"} in ${chatName}`}
          value={this.state.msg}
          onChange={e => this.setState({ msg: e.target.value })}
        />
        <button className="send-btn" type="submit">send</button>
      </form>
    );
  }

  onSend(e) {
    e.preventDefault();
    if (!this.state.msg || !this.state.msg.trim()) return;
    const body = this.state.msg;
    this.setState({ msg: "" });
    this.props.state.notabugApi.chat({
      topic: this.props.topic,
      body
    });
  }
}

const ChatInput = injectState(ChatInputBase);

export class Chat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      topic: props.topic || "whatever",
      messagesShown: 50,
      isOpen: !!props.isOpen
    };

    this.scrollToBottom = debounce(
      () => {
        if (this.scrollable && !this.state.isScrollingUp) {
          this.scrollable.scrollTop = this.scrollable.scrollHeight;
        }
      },
      50,
      { trailing: true }
    );
  }

  render() {
    return this.props.isOpen || this.state.isOpen ? (
      <div className={`chat-modal ${this.props.className}`}>
        <Listing
          Empty={Loading}
          sort={"new"}
          topics={[`chat:${this.state.topic}`]}
          days={2}
          //threshold={-1}
          limit={this.state.messagesShown}
          Container={ChatView}
          onDidUpdate={this.scrollToBottom}
          containerProps={{
            flipped: true,
            onInfiniteLoad: () => {
              this.setState({ isScrollingUp: true });
              return Promise.resolve(this.setState({ messagesShown: this.state.messagesShown + 25 }))
                .then(() => setTimeout(() => this.setState({ isScrollingUp: false }), 100));
            },
            className: "chat-message-display",
            returnScrollable: scrollable => this.scrollable = scrollable,
          }}
        />
        {this.props.isOpen ? null : (
          <button
            className="close-chat"
            onClick={() => this.setState({ isOpen: false })}
          >close</button>
        )}
        <ChatInput topic={this.state.topic} />
      </div>
    ) : (
      <button
        style={{
          position: "fixed",
          fontSize: "200%",
          right: "1em",
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

}

export const ChatPage = withRouter(({
  match: { params: { topic } },
}) => (
  <Fragment>
    <Header
      UserInfo={UserInfo}
      SrHeaderArea={() => null}
      NavTab={NavTab}
      Link={Link}
      siteprefix="t"
      subreddit={topic}
    />
    <Chat className="fullscreen-chat" isOpen />
  </Fragment>
));
