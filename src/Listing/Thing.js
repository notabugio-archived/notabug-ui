import React, { PureComponent } from "react";
import debounce from "lodash/debounce";
import { injectState } from "freactal";
import { withRouter } from "react-router-dom";
import { Loading } from "utils";
import { Submission } from "Submission";
import { Comment } from "Comment";
import { ChatMsg } from "Chat/ChatMsg";

const components = {
  submission: Submission,
  comment: Comment,
  chatmsg: ChatMsg
};

class ThingBase extends PureComponent {
  constructor(props) {
    super(props);
    const { data, expanded = false } = props;
    const nab = props.state.notabugApi;
    const scope = nab.scope;
    const scores = nab.queries.thingScores.now(scope, props.id, `~${props.listingParams.indexer}`) ||
      { up: 0, down: 0, score: 0, comment: 0 };
    const item = data || nab.queries.thingData.now(scope, props.id);
    const parentItem = props.fetchParent && item && item.opId
      ? nab.queries.thingData.now(scope, item.opId) : null;
    this.scope = scope;
    if (props.realtime) scope.realtime();
    this.state = {item, parentItem, scores, expanded, isShowingReply: false };
    this.onRefresh = debounce(() => this.onUpdate(), 250);
  }

  componentDidMount = () => { this.onFetchItem(); this.onUpdate(); this.onSubscribe(); };
  componentWillUnmount = () => this.onUnsubscribe();
  componentWillReceiveProps = (nextProps) =>
    (nextProps.realtime && !this.props.realtime) && this.scope.realtime();

  getCollapseThreshold = () => {
    const body = this.state.item && this.state.item.body || "";
    const lines = (body.length / 100) + (body.split("\n").length - 1);
    return lines - 4;
  };

  render() {
    const {
      id, isMine, rank, hideReply=false, Loading: LoadingComponent = Loading, ...props
    } = this.props;
    const { item, parentItem, scores, expanded, isShowingReply } = this.state;
    const score = scores.score || 0;
    const ThingComponent = (item ? components[item.kind] : null);
    const collapseThreshold = this.getCollapseThreshold();
    const collapsed = !isMine && !!((collapseThreshold!==null && (score < collapseThreshold)));
    if (item && !ThingComponent) return null;
    const thingProps = {
      ...props,
      ups: scores.up,
      downs: scores.down,
      comments: scores.comment,
      rank, id, item, parentItem,
      expanded, collapsed, collapseThreshold,
      isShowingReply, hideReply, isMine,
      scope: this.scope,
      onShowReply: !props.disableChildren && this.onShowReply,
      onHideReply: this.onHideReply,
      onToggleExpando: this.onToggleExpando
    };
    const renderComponent = ({ isVisible }) => !item
      ? <LoadingComponent {...thingProps} isVisible={isVisible} />
      : <ThingComponent {...thingProps} isVisible={isVisible} />;
    return renderComponent({ isVisible: true });
  }

  onToggleExpando = () => this.setState(({ expanded }) => ({ expanded: !expanded }));
  onSubscribe = () => this.scope.on(this.onRefresh);
  onUnsubscribe = () => this.scope.off(this.onRefresh);
  onUpdated = () => this.props.onDidUpdate && this.props.onDidUpdate();
  onUpdate = () => {
    const nab = this.props.state.notabugApi;
    nab.queries.thingScores(this.scope, this.props.id, `~${this.props.listingParams.indexer}`)
      .then(scores => scores && this.setState({ scores }));
    if (!this.state.item) this.onFetchItem();
  }

  onFetchItem = () => {
    const nab = this.props.state.notabugApi;
    return nab.queries.thingData(this.scope, this.props.id).then(item =>
      this.setState({ item }, () =>
        (item && item.opId && this.props.fetchParent) && this.onFetchOpItem()))
      .then(() => this.onUpdated());
  };

  onFetchOpItem = () => {
    const nab = this.props.state.notabugApi;
    return nab.queries.thingData(this.scope, this.state.item.opId)
      .then(parentItem => this.setState({ parentItem }))
      .then(() => this.onUpdated());
  };

  onShowReply = (e) => {
    e && e.preventDefault();
    this.setState({ isShowingReply: true });
  };

  onHideReply = (e) => {
    e && e.preventDefault();
    this.setState({ isShowingReply: false });
  };
}

export const Thing = withRouter(injectState(ThingBase));
