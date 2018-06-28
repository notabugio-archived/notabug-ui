import React, { PureComponent } from "react";
import throttle from "lodash/throttle";
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
    this.onUpdate = this.onUpdate.bind(this);
    this.onRefresh = throttle(this.onUpdate, 100, { trailing: true });
    this.onReceiveItem = this.onReceiveItem.bind(this);
    this.onReceiveSignedItem = this.onReceiveSignedItem.bind(this);
    this.onFetchItem = this.onFetchItem.bind(this);
  }

  componentDidMount() {
    this.onUpdate();
  }

  componentWillUnmount() {
    this.props.state.notabugApi.onChangeThingOff(this.props.id, this.onRefresh);
    this.chain && this.chain.off();
    this.chain = null;
  }

  render() {
    const { item, scores } = this.state;
    const {
      id, expanded, isMine, rank, collapseThreshold=null,
      Loading: LoadingComponent = Loading, ...props
    } = this.props;
    const score = scores.ups - scores.downs;
    const ThingComponent = (item ? components[item.kind] : null);
    if (item && !ThingComponent) return null;
    const collapsed = !isMine && !!((collapseThreshold!==null && (score < collapseThreshold)));

    return (
      <VisibilitySensor
        onChange={isVisible => isVisible && this.onFetchItem()}
        scrollThrottle={50}
        resizeThrottle={50}
        partialVisibility
        resizeCheck
      >
        {({ isVisible }) => !item
          ? (
            <LoadingComponent
              {...props}
              isVisible={isVisible}
              id={id}
              item={item}
              expanded={expanded}
              collapsed={collapsed}
              collapseThreshold={collapseThreshold}
              isMine={isMine}
              rank={rank}
              {...scores}
            />
          ) : (
            <ThingComponent
              {...props}
              isVisible={isVisible}
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
    const { state: { notabugApi } } = this.props;

    e && e.preventDefault && e.preventDefault();
    if (this.state.item || this.chain) return;
    notabugApi.onChangeThing(this.props.id, this.onRefresh);
    this.chain && this.chain.off();
    this.metaChain && this.metaChain.off();
    this.metaChain = notabugApi.souls.thing.get({ thingid: this.props.id });
    this.metaChain.on(thing => thing && thing.id && notabugApi.watchThing(thing));
    this.chain = notabugApi.souls.thingData.get({ thingid: this.props.id });
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

  onUpdate() {
    this.setState({ scores: this.getScores() });
  }
}

export const Thing = injectState(ThingBase);
