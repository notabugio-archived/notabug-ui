import React, { PureComponent, Fragment } from "react";
import throttle from "lodash/throttle";
import { injectState } from "freactal";
import { pick } from "ramda";
import { Thing } from "./Thing";

const LISTING_PROPS = [
  "days",
  "topics",
  "replyToId",
  "domain",
  "url",
  "sort",
  "limit",
  "count",
  "threshold"
];

class ListingBase extends PureComponent {
  constructor(props) {
    super(props);
    const ids = this.props.state.notabugApi.getListingIds(this.getListingParams());
    this.state = { ids };
    this.onUpdate = this.onUpdate.bind(this);
    this.onRefresh = throttle(() => this.onUpdate(), 150);
  }

  componentDidMount() {
    this.onUpdate();
    this.onSubscribe();

    if (this.props.realtime) {
      this.props.state.notabugApi.onChange(null, this.onRefresh);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.onUnsubscribe(this.props);

    if (nextProps.realtime) {
      nextProps.state.notabugApi.onChange(null, this.onRefresh);
      this.onSubscribe(nextProps);
    }

    if (JSON.stringify(this.getListingParams()) !== JSON.stringify(this.getListingParams(nextProps))) {
      this.onUpdate(nextProps);
    }
  }

  componentWillUnmount() {
    this.props.state.notabugApi.onChangeOff(null, this.onRefresh);
  }

  render() {
    const { ids } = this.state;
    const { Empty, Container=Fragment, containerProps={}, childrenPropName="children" } = this.props;
    if (!this.state.ids.length && Empty) return <Empty />;

    const contProps = {
      ...containerProps,
      [childrenPropName]: ids.map((id, idx) => this.renderThing(idx, id))
    };

    return (
      <Container {...contProps} />
    );
  }

  renderThing(idx, key) {
    const id = this.state.ids[idx];
    const { myContent = {} } = this.props;
    const count = parseInt(this.props.count, 10) || 0;
    return (
      <Thing
        Loading={this.props.Loading}
        isVisible={this.props.autoVisible}
        realtime={this.props.realtime}
        disableChildren={this.props.disableChildren}
        id={id}
        key={key || id}
        isMine={!!myContent[id]}
        rank={this.props.noRank ? null : count + idx + 1}
        onDidUpdate={this.props.onDidUpdate}
        collapseThreshold={this.props.collapseThreshold}
      />
    );
  }

  getListingParams(props) {
    return pick(
      LISTING_PROPS,
      props || this.props
    );
  }

  onSubscribe(props) {
    const { notabugApi } = (props || this.props).state;
    const { effects, realtime } = (props || this.props);
    const params = this.getListingParams();
    this.onUpdate();
    effects.onNotabugPreloadListing(params)
      .catch(error => console.warn("Error preloading listing", error))
      .then(() => this.onUpdate())
      .then(() => (this.state.ids && this.state.ids.length)
        ? realtime
          ? this.props.redis
            ? effects.onNotabugPreloadIds(this.state.ids) && setTimeout(() => notabugApi.watchListing(params), 300)
            : setTimeout(() => notabugApi.watchListing(params), 300)
          : this.props.redis && effects.onNotabugPreloadIds(this.state.ids)
        : this.onGunFallback());
    //(props || this.props).state.notabugApi.onChangeListing(this.getListingParams(), this.onRefresh);
  }

  onGunFallback() {
    this.props.state.notabugApi.onChange(null, this.onRefresh);
    this.props.state.notabugApi.watchListing(this.getListingParams());
  }

  onUnsubscribe() {
    //(props || this.props).state.notabugApi.onChangeListingOff(this.getListingParams(), this.onRefresh);
  }

  onUpdate(props) {
    const { onDidUpdate } = this.props;
    const ids = (props || this.props).state.notabugApi
      .getListingIds(this.getListingParams(props));
    if (ids.join("|") !== this.state.ids.join("|")) {
      this.setState({ ids }, onDidUpdate);
    }
  }
}

export const Listing = injectState(ListingBase);
