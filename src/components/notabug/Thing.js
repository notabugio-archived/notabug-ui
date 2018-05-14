import React, { PureComponent } from "react";
import { Submission } from "./Submission";
import { Comment } from "./Comment";

const components = {
  submission: Submission,
  comment: Comment
};

export class Thing extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { item: null, scores: {} };
    this.onRefresh = this.onRefresh.bind(this);
    this.onReceiveItem = this.onReceiveItem.bind(this);
  }

  componentDidMount() {
    this.props.listing.getThing(this.props.id).once(this.onReceiveItem);
    this.props.listing.on(this.onRefresh, this.props.id);
    this.onRefresh();
    setTimeout(() => this.onRefresh(), 500);
  }

  componentWillUnmount() {
    this.props.listing.off(this.props.id);
  }

  render() {
    const { item, scores } = this.state;
    const { id, expanded, isMine, collapseThreshold=null } = this.props;
    const score = scores.ups - scores.downs;
    const ThingComponent = (item ? components[item.kind] : null);
    if (item && !ThingComponent) return null;
    const collapsed = !isMine && !!((collapseThreshold!==null && (score < collapseThreshold)));

    return !item
      ? <div className="loading working"><div className="throbber" /></div>
      : (
        <ThingComponent
          id={id}
          item={item}
          expanded={expanded}
          collapsed={collapsed}
          collapseThreshold={collapseThreshold}
          isMine={isMine}
          {...scores}
        />
      );
  }

  getScores() {
    const { listing, id } = this.props;
    return ["up", "down", "comment"].reduce(
      (scores, type) => ({ ...scores, [type+"s"]: listing.getVoteCount(id, type) }), {});
  }

  onReceiveItem(item) {
    this.setState({ item });
  }

  onRefresh() {
    this.setState({ scores: this.getScores() });
  }
}
