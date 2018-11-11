import React, { Fragment, useContext, useState, useCallback } from "react";
import { propOr } from "ramda";
import isNode from "detect-node";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { NabContext } from "NabContext";

export const ChatInput = ({ topic }) => {
  const { me, api } = useContext(NabContext);
  const [body, setBody] = useState("");
  const alias = propOr("anon", "alias", me);
  const chatName = `t/${topic} public`;

  const onSend = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (!body || !body.trim() || body.length > COMMENT_BODY_MAX) return;
      api.chat({ topic, body });
      setBody("");
    },
    [api, body, topic]
  );

  const onChangeBody = useCallback(evt => setBody(evt.target.value), []);

  return (
    <form className="chat-input" onSubmit={onSend}>
      {isNode ? (
        <noscript>
          <input
            type="text"
            placeholder="chatting requires javascript"
            disabled
            readOnly
          />
          <button disabled className="send-btn" type="submit">
            send
          </button>
        </noscript>
      ) : (
        <Fragment>
          <input
            type="text"
            placeholder={`speaking as ${alias ? alias : "anon"} in ${chatName}`}
            value={body}
            onChange={onChangeBody}
          />
          <button className="send-btn" type="submit">
            send
          </button>
        </Fragment>
      )}
    </form>
  );
};
