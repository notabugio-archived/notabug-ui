/* globals Promise */
import React, { PureComponent } from "react";
import debounce from "lodash/debounce";
import { Subreddit } from "snew-classic-ui";
import { withRouter } from "react-router-dom";
import { SidebarTitlebox } from "./SidebarTitlebox";
import { LoginFormSide } from "./LoginSignupPage";
import { NavTab } from "./NavTab";
import { UserInfo } from "./UserInfo";
import { Link } from "./Link";
import { Listing } from "./Listing";
import { injectState } from "freactal";
import ChatView from "react-chatview";
import { Loading } from "./Loading";
import { LoadingChatMsg } from "./LoadingChatMsg";

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
      messagesShown: 30,
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
          noRank
          redis
          realtime
          autoVisible
          disableChildren
          Empty={Loading}
          Loading={LoadingChatMsg}
          sort={"active"}
          topics={this.props.withSubmissions
            ? [`chat:${this.state.topic}`, "all"]
            : [`chat:${this.state.topic}`]}
          days={3}
          threshold={-1}
          collapseThreshold={0}
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
          right: "25px",
          bottom: "25px",
          border: "1px solid #5f99cf",
          padding: "4px 10px"
        }}
        onClick={() => this.setState({ isOpen: true })}
      >
        open chat
      </button>
    );
  }

}

export const ChatPage = withRouter(injectState(({
  state: { notabugUser },
  match: { params: { topic } },
}) => (
  <Subreddit
    Link={Link}
    SidebarTitlebox={SidebarTitlebox}
    FooterParent={() => null}
    SidebarSearch={() => null}
    LoginFormSide={LoginFormSide}
    RecentlyViewedLinks={() => null}
    AccountActivityBox={() => null}
    Timestamp={() => null}
    SrHeaderArea={() => null}
    UserInfo={UserInfo}
    NavTab={NavTab}
    username={notabugUser}
    subreddit={topic || ""}
    siteprefix="t"
    isShowingCustomStyleOption={false}
  >
    <Chat className="fullscreen-chat" isOpen withSubmissions />
  </Subreddit>
)));
