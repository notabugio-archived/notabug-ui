import React, { PureComponent } from "react";
import debounce from "lodash/debounce";
import { Submission } from "./Submission";
import { Comment } from "./Comment";
import { ChatMsg } from "./ChatMsg";
import { injectState } from "freactal";
import VisibilitySensor from "react-visibility-sensor";
import { Loading } from "./Loading";

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
    this.onFetchItem = this.onFetchItem.bind(this);
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

    return (
      <VisibilitySensor
        onChange={isVisible => isVisible && this.onFetchItem()}
        scrollThrottle={50}
        resizeThrottle={50}
        offset={{ top: 50, bottom: 50 }}
        partialVisibility
        resizeCheck
      >
        {({ isVisible }) => !item
          ? (
            <Loading isVisible={isVisible} onClick={this.onFetchItem} />
          ) : (
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
          )
        }
      </VisibilitySensor>
    );
  }

  onFetchItem(e) {
    e && e.preventDefault && e.preventDefault();
    if (this.state.item || this.chain) return;
    this.props.state.notabugApi.onChangeThing(this.props.id, this.onRefresh);
    this.chain && this.chain.off();
    this.chain = this.props.state.notabugApi.souls.thingData.get({ thingid: this.props.id });
    this.chain.on(this.onReceiveItem);
  }

  getScores() {
    const { state: { notabugApi }, id } = this.props;
    return ["up", "down", "comment"].reduce(
      (scores, type) => ({ ...scores, [type+"s"]: notabugApi.getVoteCount(id, type) }), {});
  }

  onReceiveItem(item) {
    if (!item || this.state.item) return;
    const { author, authorId, ...itemData } = item;
    //const { onDidUpdate } = this.props;
    this.setState({
      item: this.props.state.notabugApi.gun.user ? itemData : item,
      scores: this.getScores()
    }); //, onDidUpdate);
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
