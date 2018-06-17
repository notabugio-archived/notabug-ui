import React from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { Link } from "./Link";
import { Comment } from "./Comment";
import { injectState } from "freactal";
import { notabugVotable } from "state/notabug";

const ChatMsgEntry = notabugVotable(injectState(({
  ...props,
  state: { isVotingUp, isVotingDown },
  //effects
}) => (
  <SnewThingCommentEntry
    {...props}
    score={null}
    Link={Link}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
    isVoting={isVotingUp || isVotingDown}
    //onVoteUp={effects.onVoteUp}
    //onVoteDown={effects.onVoteDown}
  />
)));

export const ChatMsg = (props) => (
  <Comment {...props} ThingCommentEntry={ChatMsgEntry} />
);
