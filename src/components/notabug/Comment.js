import React, { PureComponent } from "react";
import { pathOr, compose } from "ramda";
import Spinner from "react-spinkit";
import { ThingComment } from "snew-classic-ui";
import { Markdown } from "./Markdown";
import { Timestamp } from "./Timestamp";
import { Link } from "./Link";
import { NestedListing } from "./NestedListing";
import { ThingCommentEntry } from "./CommentEntry";
import slugify from "slugify";

export class Comment extends PureComponent {
  constructor(props) {
    super(props);
    const { collapsed=false } = props;
    this.state = { collapsed };
    this.onToggleExpand = this.onToggleExpand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.collapsed !== this.props.collapsed) {
      this.setState({ collapsed: nextProps.collapsed });
    }
  }

  render() {
    const { id, ups=0, downs=0, isMine, disableChildren, fetchParent } = this.props;
    const item = this.props.item || {
      body: "loading...",
      timestamp: this.props.state.notabugApi.getTimestamp(this.props.id)
    };

    const parentParams = fetchParent ? {
      fetchParent: true,
      showLink: true,
      link_title: pathOr("", ["parentItem", "title"], this.props),
      link_permalink: compose(
        ({ topic, title }) => {
          if (!item.opId || !topic || !title) return;
          return `/t/${topic}/comments/${item.opId}/${slugify(title.toLowerCase())}`;
        },
        pathOr({}, ["parentItem"])
      )(this.props),
      link_author: pathOr(null, ["parentItem", "author"], this.props),
      subreddit: pathOr(null, ["parentItem", "topic"], this.props),
    } : {};

    return (
      <ThingComment
        ThingCommentEntry={ThingCommentEntry}
        Markdown={this.props.item ? Markdown : () => (
          <div className="usertext-body may-blank-within md-container">
            <div className="md">
              <Spinner
                name="ball-beat"
                color="#cee3f8"
              />
              <div className="clearleft" />
            </div>
          </div>
        )}
        Timestamp={Timestamp}
        Link={Link}
        NestedListing={disableChildren ? () => null : NestedListing}
        {...this.props}
        id={id}
        body={item.body}
        author={item.author}
        siteprefix="t"
        name={id}
        parent_id={item.replyToId}
        created={item.timestamp / 1000}
        created_utc={item.timestamp / 1000}
        ups={ups}
        downs={downs}
        votableId={id}
        showLink
        {...parentParams}
        score={`(+${ups} | -${downs})`}
        scoreTooltip={`+${ups} / -${downs}`}
        distinguished={isMine ? "me" : null}
        collapsed={this.state.collapsed}
        onToggleExpand={this.onToggleExpand}
      />
    );
  }

  onToggleExpand() {
    this.setState({ collapsed: !this.state.collapsed });
  }
}
