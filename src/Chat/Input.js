import React, { Fragment, useContext, useState, useCallback } from "react";
import { propOr } from "ramda";
import isNode from "detect-node";
import { MAX_THING_BODY_SIZE } from "notabug-peer";
import { useNotabug } from "NabContext";

export const ChatInput = ({ ListingContext }) => {
  const { me, api, onMarkMine } = useNotabug();
  const { submitTopic: topic, addSpeculativeId } = useContext(ListingContext);
  const [body, setBody] = useState("");
  const alias = propOr("anon", "alias", me);
  const chatName = `t/${topic} public`;

  const onSend = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (!body || !body.trim() || body.length > MAX_THING_BODY_SIZE) return;
      api.chat({ topic, body }).then((res) => {
        const id = res && res.id;
        if (!id) return;
        onMarkMine(id);
        addSpeculativeId && addSpeculativeId(id);
      });
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
