import React from "react";
import NestedListingComponent from "./NestedListing";
import ThingCommentEntryComponent from "./ThingCommentEntry";

const getChildComments = replies => ((replies && replies.data && replies.data.children) || []);

const ThingComment = ({
  NestedListing = NestedListingComponent,
  ThingCommentEntry = ThingCommentEntryComponent,
  collapsed = false,
  replyCount = null,
  ...props
}) => (
  <div
    className={[
      "thing id-t1_h1 comment",
      ((props.banned_by && "spam") || ""),
      ((props.stickied && "stickied") || ""),
      ((props.controversiality && "controversial") || ""),
      ((props.score_hidden & "score-hidden") || ""),
      (props.distinguished || ""),
      collapsed ? "collapsed" : "noncollapsed"
    ].join(" ")}
    data-author={props.author}
    data-author-fullname="t2_19"
    data-fullname="t1_h1"
    data-subreddit="pics"
    data-subreddit-fullname="t4_5"
    data-type="comment"
    id="thing_t1_h1"
  >
    <ThingCommentEntry
      {...props}
      collapsed={collapsed}
      replyCount={props.replies ? getChildComments(props.replies).length : replyCount}
    />
    <div className="child">
      {collapsed ? null : <NestedListing {...{ ...props, allChildren: getChildComments(props.replies) }} />}
    </div>
    <div className="clearleft" />
  </div>
);

export default ThingComment;
