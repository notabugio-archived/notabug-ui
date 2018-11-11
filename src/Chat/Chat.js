import React, { useState, useCallback, useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Content } from "Page";
import { Link, JavaScriptRequired } from "utils";
import { getFirehoseListingParams } from "Routing/routes";
import { useListing } from "Listing";

export const Chat = withRouter(({
  isOpen: startOpen,
  topic = "whatever",
  className = "",
  location,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const listingParams = useMemo(() => getFirehoseListingParams(props), [topic]);
  const listingProps = useListing({ listingParams });

  if (!isOpen)
    return (
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
          onClick={openChat}
        >
          open chat
        </button>
      </JavaScriptRequired>
    );

  return (
    <div className={`chat-modal ${className}`}>
      <Content
        isChat
        submitTopic={topic}
        location={location}
        {...listingProps}
      />
      <div className="chat-modal-controls">
        <Link href="/firehose">
          <button
            className="chat-dialogue-fullpage-link"
            title="fullpage chat with live submissions and comments"
          >
            firehose
          </button>
        </Link>
        <Link href="/t/chat:all/new">
          <button className="chat-dialogue-history-link">history</button>
        </Link>
        <button className="close-chat" onClick={closeChat}>
          close
        </button>
      </div>
    </div>
  );
});
