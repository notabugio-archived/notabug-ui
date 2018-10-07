import React from "react";

const CommentAreaTitle = ({ num_comments, commentsTitle }) => (
  <div className="panestack-title">
    <span className="title">{commentsTitle || `all ${num_comments ? num_comments : ""} comments`}</span>
  </div>
);

export default CommentAreaTitle;
