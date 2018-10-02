import { ZalgoPromise as Promise } from "zalgo-promise";
import debounce from "lodash/debounce";
import React, { PureComponent } from "react";
import ChatView from "react-chatview";
import { Link, Loading, JavaScriptRequired } from "utils";
import { Listing } from "Listing";
import { LoadingChatMsg } from "./LoadingChatMsg";
import ChatInput from "./Input";
import { getFirehoseListingParams } from "Routing/routes";

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
      100
    );

    this.stoppedScrolling = debounce(
      () => this.setState({ isScrollingUp: false }),
      5000
    );
  }

  render = () => this.props.isOpen || this.state.isOpen ? (
    <div className={`chat-modal ${this.props.className}`}>
      <Listing
        noRank
        realtime
        disableChildren
        Empty={Loading}
        Loading={LoadingChatMsg}
        limit={this.state.messagesShown}
        listingParams={{
          ...getFirehoseListingParams(this.props),
          sort: "new",
          threshold: -1
        }}
        fetchParent
        hideReply
        collapseThreshold={0}
        Container={ChatView}
        onDidUpdate={this.scrollToBottom}
        containerProps={{
          flipped: true,
          onInfiniteLoad: () => {
            this.setState({ isScrollingUp: true });
            return Promise.resolve(this.setState({ messagesShown: this.state.messagesShown + 25 }))
              .then(this.stoppedScrolling);
          },
          className: "chat-message-display",
          returnScrollable: scrollable => this.scrollable = scrollable,
        }}
      />
      {this.props.isOpen ? null : (
        <div className="chat-modal-controls">
          <Link href="/chat">
            <button
              className="chat-dialogue-fullpage-link"
              title="fullpage chat with live submissions and comments"
            >firehose</button>
          </Link>
          <Link href="/t/chat:all/new">
            <button
              className="chat-dialogue-history-link"
            >history</button>
          </Link>
          <button
            className="close-chat"
            onClick={() => this.setState({ isOpen: false })}
          >close</button>
        </div>
      )}
      <ChatInput topic={this.state.topic} />
    </div>
  ) : (
    <JavaScriptRequired silent>
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
    </JavaScriptRequired>
  );
}
