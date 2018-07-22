import React, { PureComponent, Fragment } from "react";
import debounce from "lodash/debounce";
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
    this.onRefresh = debounce(() => this.onUpdate(), 500);
  }

  componentDidMount() {
    this.onUpdate();
    this.onSubscribe();

    if (this.props.realtime) {
      this.props.state.notabugApi.onChange(null, this.onRefresh);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.realtime) {
      this.props.state.notabugApi.onChangeOff(null, this.onRefresh);
      nextProps.state.notabugApi.onChange(null, this.onRefresh);
      this.onSubscribe(nextProps);
    }

    if (JSON.stringify(this.getListingParams()) !== JSON.stringify(this.getListingParams(nextProps))) {
      if (nextProps.count !== this.props.count && !nextProps.realtime) {
        this.onSubscribe(nextProps);
      } else {
        this.onUpdate(nextProps);
      }
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
        redis={this.props.redis}
        fetchParent={this.props.fetchParent}
        hideReply={this.props.hideReply}
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
    const { effects, realtime } = (props || this.props);
    const params = this.getListingParams();
    this.onUpdate(props);

    const promise = effects.onNotabugPreloadListing(params).then(() => this.onUpdate());
    return promise
      .catch(error => console.warn("Error preloading listing", error))
      .then(() => {
        if (realtime) {
          if (this.props.redis) {
            setTimeout(() => this.onGunFallback(), 300);
            return effects.onNotabugPreloadIds(this.state.ids);
          } else {
            this.onGunFallback();
          }
        } else if (this.props.redis) {
          return effects.onNotabugPreloadIds(this.state.ids);
        }
      })
      .then(() => this.onUpdate());
  }

  onGunFallback() {
    this.props.state.notabugApi.onChange(null, this.onRefresh);
    this.props.state.notabugApi.watchListing(this.getListingParams());
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
