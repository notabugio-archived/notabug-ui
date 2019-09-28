import React, { Fragment, useContext, useState, useCallback } from "react";
import { propOr } from "ramda";
import isNode from "detect-node";
import { Constants } from "@notabug/peer";
import { useNotabug } from "/NabContext";

const MAX_TEXTAREA_HEIGHT = 120

export const ChatInput = ({ ListingContext, scrollToBottom }) => {
  const { me, api, onMarkMine } = useNotabug();
  const { submitTopic: topic, addSpeculativeId } = useContext(ListingContext);
  const [body, setBody] = useState("");
  const alias = propOr("anon", "alias", me);
  const chatName = `t/${topic} public`;

  const resizeInput = (target, reset) => {
    if(reset) {
      target.style.height = target.style.minHeight
    }
    else {
      target.style.height = 0 // to make the box shrink if required
      target.style.height = Math.min(MAX_TEXTAREA_HEIGHT, target.scrollHeight) + "px"
    }
    target.style.overflowY = target.scrollHeight > MAX_TEXTAREA_HEIGHT ? "scroll" : "hidden"
  }

  const onSend = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (!body || !body.trim())
        return;

      const multiline = body.replace(/\n/g, "\n\n")
      if(multiline.length > Constants.MAX_THING_BODY_SIZE)
        return;

      api.chat({ topic, body: multiline }).then(res => {
        const id = res && res.id;

        if (!id) return;
        onMarkMine(id);
        addSpeculativeId && addSpeculativeId(id);
      });
      setBody("");
      scrollToBottom("force");
      resizeInput(evt.target, true);
    },
    [api, body, topic, scrollToBottom]
  );

  const onChangeBody = useCallback(evt => {
      setBody(evt.target.value);
      resizeInput(evt.target)
  }, [])

  const onKeyDown = useCallback(evt => {
    if(evt && evt.keyCode == 13 && !evt.shiftKey) {
      onSend(evt);
    }
  }, [api, body, topic])

  return (
    <form className="chat-input" onSubmit={onSend}>
      {isNode ? (
        <noscript>
          <texarea
            rows="1"
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
          <textarea
            placeholder={`speaking as ${alias ? alias : "anon"} in ${chatName}`}
            rows="1"
            value={body}
            onChange={onChangeBody}
            onKeyDown={onKeyDown}
          />
          <button className="send-btn" type="submit">
            send
          </button>
        </Fragment>
      )}
    </form>
  );
};
