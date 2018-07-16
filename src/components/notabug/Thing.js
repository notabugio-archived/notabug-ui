import React, { PureComponent } from "react";
import { path } from "ramda";
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
    const { expanded = false } = props;
    this.state = { scores: {}, expanded };
    this.onToggleExpando = this.onToggleExpando.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onSubscribe = this.onSubscribe.bind(this);
    this.onRefresh = throttle(this.onUpdate, 100, { trailing: true });
    this.onReceiveItem = this.onReceiveItem.bind(this);
    this.onReceiveParentItem = this.onReceiveParentItem.bind(this);
    this.onFetchItem = this.onFetchItem.bind(this);
  }

  componentDidMount() {
    if (this.props.isVisible) this.onFetchItem();
  }

  componentWillUnmount() {
    this.props.state.notabugApi.onChangeThingOff(this.props.id, this.onRefresh);
    this.chain && this.chain.off();
    this.chain = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isVisible && nextProps.realtime !== this.props.realtime && nextProps.realtime) {
      this.onFetchItem();
    }
    if (nextProps.fetchParent) this.onFetchParentItem();
  }

  render() {
    const {
      id, isMine, rank, collapseThreshold=null, hideReply=false,
      Loading: LoadingComponent = Loading, ...props
    } = this.props;
    const { scores, expanded } = this.state;
    const { item, parentItem } = this.getItemAndParent();
    const score = ((scores.ups || 0) - (scores.downs || 0) || 0);
    const ThingComponent = (item ? components[item.kind] : null);
    const collapsed = !isMine && !!((collapseThreshold!==null && (score < collapseThreshold)));
    if (item && !ThingComponent) return null;

    const renderComponent = ({ isVisible }) => !item
      ? (
        <LoadingComponent
          {...props}
          id={id}
          item={item}
          parentItem={parentItem}
          expanded={expanded}
          collapsed={collapsed}
          hideReply={hideReply}
          collapseThreshold={collapseThreshold}
          isVisible={isVisible}
          isMine={isMine}
          rank={rank}
          onSubscribe={this.onSubscribe}
          {...scores}
        />
      ) : (
        <ThingComponent
          {...props}
          id={id}
          item={item}
          parentItem={parentItem}
          expanded={this.state.expanded}
          collapsed={collapsed}
          hideReply={hideReply}
          collapseThreshold={collapseThreshold}
          isVisible={isVisible}
          isMine={isMine}
          rank={rank}
          onSubscribe={this.onSubscribe}
          onToggleExpando={this.onToggleExpando}
          {...scores}
        />
      );

    return this.props.isVisible ? (
      renderComponent({ isVisible: true })
    ) : (
      <VisibilitySensor
        onChange={isVisible => isVisible && this.onFetchItem()}
        scrollThrottle={50}
        resizeThrottle={50}
        partialVisibility
        resizeCheck
      >{renderComponent}</VisibilitySensor>
    );
  }

  onFetchItem(e) {
    const { redis, id, realtime, state: { notabugApi } } = this.props;
    const existingItem = notabugApi.getThingData(id);

    e && e.preventDefault && e.preventDefault();
    this.props.fetchParent && this.onFetchParentItem();
    this.onUpdate();

    if (this.props.realtime) this.onSubscribe();

    if (redis && !realtime && !existingItem && !this.props.noRealtime) {
      setTimeout(() => ( // fallback to gun if thing data not otherwise available
        !notabugApi.getThingData(id) &&
        notabugApi.fetchThingData(id).then(this.onReceiveItem)
      ), 1000);
    }

    if ((redis && !realtime) || existingItem) return;
    notabugApi.fetchThingData(id).then(this.onReceiveItem);
  }

  onFetchParentItem() {
    const { parentItem, parentId } = this.getItemAndParent();
    const notabugApi = this.props.state.notabugApi;
    if (!parentItem && parentId) notabugApi.fetchThingData(parentId).then(this.onReceiveParentItem);
  }

  getItemAndParent() {
    const { id } = this.props;
    const item = this.state.item || path(["state", "notabugState", "data", id], this.props);
    const parentId = path(["opId"], item);
    const parentItem = parentId
      ? this.state.parentItem || path(["state", "notabugState", "data", parentId], this.props)
      : null;
    return { item, parentId, parentItem };
  }

  getScores() {
    const { state: { notabugApi }, id } = this.props;
    return ["up", "down", "comment"].reduce(
      (scores, type) => ({ ...scores, [type+"s"]: notabugApi.getVoteCount(id, type) }), {});
  }

  onSubscribe() {
    const { state: { notabugApi } } = this.props;
    notabugApi.onChangeThing(this.props.id, this.onRefresh);
    this.metaChain && this.metaChain.off();
    this.metaChain = notabugApi.souls.thing.get({ thingid: this.props.id });
    this.metaChain.on(thing => thing && thing.id && notabugApi.watchThing(thing));
  }

  onReceiveItem(item) {
    item && this.setState({ item, scores: this.getScores() });
    if (item && this.props.fetchParent) this.onFetchParentItem();
  }

  onReceiveParentItem(parentItem) {
    parentItem && this.setState({ parentItem });
  }

  onUpdate() {
    this.setState({ scores: this.getScores() });
  }

  onToggleExpando() {
    this.setState({ expanded: !this.state.expanded });
  }
}

export const Thing = injectState(ThingBase);
