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
    this.state = { item: null, parentItem: null, scores: {}, expanded };
    this.onToggleExpando = this.onToggleExpando.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onSubscribe = this.onSubscribe.bind(this);
    this.onRefresh = throttle(this.onUpdate, 100, { trailing: true });
    this.onReceiveItem = this.onReceiveItem.bind(this);
    this.onReceiveParentItem = this.onReceiveParentItem.bind(this);
    this.onReceiveSignedItem = this.onReceiveSignedItem.bind(this);
    this.onFetchItem = this.onFetchItem.bind(this);
  }

  componentDidMount() {
    if (this.props.isVisible) this.onFetchItem();
  }

  componentWillUnmount() {
    this.props.state.notabugApi.onChangeThingOff(this.props.id, this.onRefresh);
    this.chain && this.chain.off();
    this.parentChain && this.parentChain.off();
    this.chain = null;
    this.parentChain = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isVisible && nextProps.realtime !== this.props.realtime && nextProps.realtime) {
      this.onFetchItem();
    }

    if (nextProps.fetchParent) this.onFetchParentItem();
  }

  render() {
    const { scores, expanded } = this.state;
    const {
      id, isMine, rank, collapseThreshold=null, hideReply=false,
      Loading: LoadingComponent = Loading, ...props
    } = this.props;

    const item = this.state.item || path(["state", "thingData", id], this.props);
    const parentId = path(["opId"], item);
    const parentItem = parentId
      ? this.state.parentItem || path(["state", "thingData", parentId], this.props)
      : null;
    const score = ((scores.ups || 0) - (scores.downs || 0) || 0);
    const ThingComponent = (item ? components[item.kind] : null);
    if (item && !ThingComponent) return null;
    const collapsed = !isMine && !!((collapseThreshold!==null && (score < collapseThreshold)));

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
    const existingItem = this.state.item || path(["state", "thingData", id], this.props);

    this.props.fetchParent && this.onFetchParentItem();

    if ((redis && !realtime) || existingItem) return this.onUpdate();

    e && e.preventDefault && e.preventDefault();
    if (this.state.item || this.chain) return;

    this.onUpdate();
    this.chain && this.chain.off();

    if (this.props.realtime) {
      this.onSubscribe();
    }

    this.chain = notabugApi.souls.thingData.get({ thingid: this.props.id });
    this.chain.on(this.onReceiveItem);
  }

  onFetchParentItem() {
    const { id, state: { notabugApi } } = this.props;
    const item = this.state.item || path(["state", "thingData", id], this.props);
    const parentId = path(["opId"], item);
    const parentItem = parentId
      ? this.state.parentItem || path(["state", "thingData", parentId], this.props)
      : null;

    if (!parentItem && parentId) {
      this.parentChain && this.parentChain.off();
      this.parentChain = notabugApi.souls.thingData.get({ thingid: parentId });
      this.parentChain.on(this.onReceiveParentItem);
    }
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

  onReceiveParentItem(parentItem) {
    if (!parentItem) return;
    this.setState({ parentItem });
    this.parentChain && this.parentChain.off();
    this.parentChain = null;
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
  onToggleExpando() {
    this.setState({ expanded: !this.state.expanded });
  }
}

export const Thing = injectState(ThingBase);
