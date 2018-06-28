import React, { PureComponent } from "react";
import Spinner from "react-spinkit";
import { ThingComment } from "snew-classic-ui";
import { Markdown } from "./Markdown";
import { Timestamp } from "./Timestamp";
import { Link } from "./Link";
import { NestedListing } from "./NestedListing";
import { ThingCommentEntry } from "./CommentEntry";

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
    const { id, ups, downs, isMine, disableChildren } = this.props;
    const item = this.props.item || {
      body: "loading...",
      timestamp: this.props.state.notabugApi.getTimestamp(this.props.id)
    };

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
        name={id}
        parent_id={item.replyToId}
        created={item.timestamp / 1000}
        created_utc={item.timestamp / 1000}
        ups={ups}
        downs={downs}
        votableId={id}
        score={ups-downs}
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
