import React, { PureComponent } from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { Link } from "./Link";
import { injectState } from "freactal";
import { notabugVotable } from "state/notabug";

class ThingCommentEntryBase extends PureComponent {
  constructor(props) {
    super(props);
    this.onVoteUp = this.onVoteUp.bind(this);
    this.onVoteDown = this.onVoteDown.bind(this);
  }

  render() {
    const {
      state: { isVotingUp, isVotingDown },
      effects,
      ...props
    } = this.props;

    return (
      <SnewThingCommentEntry
        {...props}
        Link={Link}
        likes={isVotingUp ? true : isVotingDown ? false : undefined}
        onShowReply={this.props.hideReply ? null : e => {
          e.preventDefault();
          effects.onNotabugSetReplyTo(props.id);
        }}
        isVoting={isVotingUp || isVotingDown}
        onVoteUp={this.onVoteUp}
        onVoteDown={this.onVoteDown}
      />
    );
  }

  onVoteUp() {
    const { onSubscribe } = this.props;
    onSubscribe && onSubscribe();
    this.props.effects.onVoteUp();
  }

  onVoteDown() {
    const { onSubscribe } = this.props;
    onSubscribe && onSubscribe();
    this.props.effects.onVoteDown();
  }
}

export const ThingCommentEntry = notabugVotable(injectState(ThingCommentEntryBase));
