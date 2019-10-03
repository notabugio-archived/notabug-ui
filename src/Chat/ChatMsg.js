import React, { useCallback } from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "/vendor/snew-classic-ui";
import { Constants } from "@notabug/peer";
import { Link } from "/utils";
import { AuthorLink } from "/Auth";
import { Comment } from "/Comment";

const ChatMsgEntry = ({ isVotingUp, isVotingDown, ...props }) => {
  const onClickReply = useCallback(evt => {
      evt && evt.preventDefault()
      props.onQuoteChat && props.onQuoteChat(props.body)
    }, []
  )

  return (
    <SnewThingCommentEntry
      {...{ ...props, Link, AuthorLink }}
      onToggleEditing={null}
      postTagline={
        <>
          { props.topic ? (
              <span className="chat-topic-name">
                {" "}
                in <Link href={`/t/${props.topic}/chat`}>{props.topic}</Link>
              </span>
            ) : null
          }
          {" "}
          <Link
            className="tagline-action"
            onClick={onClickReply}
            title="quote this message"
          >
            reply
          </Link>
        </>
      }
      body={
        props.body
          ? props.body.slice(0, Constants.MAX_THING_BODY_SIZE)
          : props.body
      }
      score={props.ups || props.downs ? props.score : null}
      likes={isVotingUp ? true : isVotingDown ? false : undefined}
      isVoting={isVotingUp || isVotingDown}
    />
  )
}

export const ChatMsg = props => (
  <Comment {...props} ThingCommentEntry={ChatMsgEntry} />
);
