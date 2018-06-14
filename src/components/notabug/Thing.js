import React, { PureComponent } from "react";
import debounce from "lodash/debounce";
import { Submission } from "./Submission";
import { Comment } from "./Comment";
import { ChatMsg } from "./ChatMsg";
import { injectState } from "freactal";

const components = {
  submission: Submission,
  comment: Comment,
  chatmsg: ChatMsg
};

class ThingBase extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { item: null, scores: {} };
    this.onRefresh = debounce(this.onRefresh.bind(this), 50, { trailing: true });
    this.onReceiveItem = this.onReceiveItem.bind(this);
    this.onReceiveSignedItem = this.onReceiveSignedItem.bind(this);
  }

  componentDidMount() {
    this.props.state.notabugApi.onChangeThing(this.props.id, this.onRefresh);
    this.chain = this.props.state.notabugApi.souls.thingData.get({ thingid: this.props.id });
    this.chain.on(this.onReceiveItem);
  }

  componentWillUnmount() {
    this.props.state.notabugApi.onChangeThingOff(this.props.id, this.onRefresh);
    this.chain && this.chain.off();
    this.chain = null;
  }

  render() {
    const { item, scores } = this.state;
    const { id, expanded, isMine, rank, collapseThreshold=null, ...props } = this.props;
    const score = scores.ups - scores.downs;
    const ThingComponent = (item ? components[item.kind] : null);
    if (item && !ThingComponent) return null;
    const collapsed = !isMine && !!((collapseThreshold!==null && (score < collapseThreshold)));

    return !item
      ? <div className="loading working"><div className="throbber" /></div>
      : (
        <ThingComponent
          {...props}
          id={id}
          item={item}
          expanded={expanded}
          collapsed={collapsed}
          collapseThreshold={collapseThreshold}
          isMine={isMine}
          rank={rank}
          {...scores}
        />
      );
  }

  getScores() {
    const { state: { notabugApi }, id } = this.props;
    return ["up", "down", "comment"].reduce(
      (scores, type) => ({ ...scores, [type+"s"]: notabugApi.getVoteCount(id, type) }), {});
  }

  onReceiveItem(item) {
    if (!item || this.state.item) return;
    const { author, authorId, ...itemData } = item;
    this.setState({
      item: this.props.state.notabugApi.gun.user ? itemData : item,
      scores: this.getScores()
    });
    this.chain && this.chain.off();
    this.chain = null;

    if (author && authorId && this.props.state.notabugApi.gun.user) {
      const chain = this.props.state.notabugApi.gun
        .get(`~${authorId}`)
        .get("things")
        .get(this.props.state.notabugApi.souls.thing.soul({ thingid: this.props.id }))
        .get("data");
      chain.on(this.onReceiveSignedItem);
    }
  }

  onReceiveSignedItem(item) {
    if (!item) return;
    this.chain && this.chain.off();
    this.chain = null;
    this.setState({ item, scores: this.getScores() });
  }

  onRefresh() {
    this.setState({ scores: this.getScores() });
  }
}

export const Thing = injectState(ThingBase);
