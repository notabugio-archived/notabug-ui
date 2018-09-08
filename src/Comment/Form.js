import React, { PureComponent } from "react";
import { injectState } from "freactal";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { CommentForm as SnewCommentForm } from "snew-classic-ui";
import { JavaScriptRequired } from "utils";

export class CommentForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { body: "", isSaving: false };
  }

  render() {
    const { id, opId, ...props } = this.props;
    const { isSaving, body } = this.state;
    return isSaving ? null : (
      <JavaScriptRequired>
        <SnewCommentForm
          {...props}
          body={body}
          autoFocus={id !== opId}
          commentError={body && this.getCommentError()}
          onChangeBody={this.onChangeBody}
          onSubmit={this.onSave}
          onCancel={this.props.onHideReply}
        />
      </JavaScriptRequired>
    );
  }

  getCommentError = () => {
    const { body } = this.state;
    if (body.length > COMMENT_BODY_MAX) return `this is too long (max: ${COMMENT_BODY_MAX})`;
    if (!body.trim().length) return "a body is required";
    return null;
  };
  onChangeBody = e => this.setState({ body: e.target.value });
  onSave = (e) => {
    const {
      props: { id: replyToId, opId, topic, effects, state: { notabugApi } },
      state: { body, isSaving }
    } = this;
    e && e.preventDefault();
    if (isSaving || this.getCommentError()) return;

    this.setState({ isSaving: true });
    return notabugApi.comment({ body, opId, topic, replyToId })
      .then(({ id }) => {
        effects.onNotabugMarkMine(id);
        notabugApi.scope.realtime();
      }).then(() => {
        this.setState({ body: "", isSaving: false });
        this.props.onHideReply && this.props.onHideReply();
      });
  };
}

export default injectState(CommentForm);
