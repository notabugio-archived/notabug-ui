import React, { PureComponent, Fragment } from "react";
import debounce from "lodash/debounce";
import { injectState } from "freactal";
import pick from "ramda/es/pick";
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
    this.onRefresh = debounce(() => this.onUpdate(), 100, { trailing: true });
    props.state.notabugApi.onChange(null, this.onRefresh);
  }

  componentDidMount() {
    const ids = this.props.state.notabugApi.getListingIds(this.getListingParams());
    this.onSubscribe();
    this.setState({ ids }, this.onRefresh);
  }

  componentWillReceiveProps(nextProps) {
    this.onUnsubscribe(this.props);
    this.onSubscribe(nextProps);
    this.onUpdate(nextProps);
  }

  componentWillUnmount() {
    this.props.state.notabugApi.onChangeOff(null, this.onRefresh);
  }

  render() {
    const { ids} = this.state;
    const { myContent = {}, Empty, Container=Fragment, containerProps={} } = this.props;
    const count = parseInt(this.props.count, 10) || 0;
    if (!this.state.ids.length && Empty) return <Empty />;

    return (
      <Container {...containerProps} >
        {ids.map((id, idx) =>(
          <Thing
            id={id}
            key={id}
            isMine={!!myContent[id]}
            rank={count + idx + 1}
            onDidUpdate={this.props.onDidUpdate}
            collapseThreshold={this.props.collapseThreshold}
          />
        ))}
      </Container>
    );
  }

  getListingParams(props) {
    return pick(
      LISTING_PROPS,
      props || this.props
    );
  }

  onSubscribe(props) {
    (props || this.props).state.notabugApi.watchListing(this.getListingParams());
    //(props || this.props).state.notabugApi.onChangeListing(this.getListingParams(), this.onRefresh);
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
