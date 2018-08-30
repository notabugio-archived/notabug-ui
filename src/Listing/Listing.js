import React, { PureComponent, Fragment } from "react";
import debounce from "lodash/debounce";
import { pick } from "ramda";
import { injectState } from "freactal";
import { withRouter } from "react-router-dom";
import { Thing } from "./Thing";

const LISTING_PROPS = [
  "days",
  "topics",
  "opId",
  "replyToId",
  "authorIds",
  "domain",
  "url",
  "sort",
  "limit",
  "count",
  "threshold"
];

export class Listing extends PureComponent {
  constructor(props) {
    super(props);
    this.listing = props.listing || props.state.notabugApi.scopedListing({
      onFetchCache: () =>
        fetch(`${this.props.location.pathname}.json?${this.props.location.search}`)
          .then(response => {
            if (response.status !== 200) throw new Error("Bad response from server");
            return response.json();
          })
    });
    if (props.realtime) this.listing.scope.realtime();
    this.state = { ids: this.listing.ids.now(this.getListingParams(props)) || [] };
    this.onRefresh = debounce(() => this.onUpdate(), 250);
  }

  componentDidMount() {
    this.onUpdate();
    this.onSubscribe();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.getListingParams()) !== JSON.stringify(this.getListingParams(nextProps)))
      this.onUpdate(nextProps);
    if (nextProps.realtime && !this.props.realtime) this.listing.scope.realtime();
  }

  componentWillUnmount = () => this.onUnsubscribe();

  render() {
    const { Empty, Container=Fragment, containerProps={}, childrenPropName="children" } = this.props;
    const { ids } = this.state;
    if (!ids.length && Empty) return <Empty />;
    const rendered = ids.map((id, idx) => this.renderThing(idx, id));
    return <Container {...{...containerProps, [childrenPropName]: rendered }} />;
  }

  renderThing(idx, key) {
    const { myContent = {} } = this.props;
    const count = parseInt(this.props.count, 10) || 0;
    const id = this.state.ids[idx];
    return (
      <Thing
        Loading={this.props.Loading}
        isVisible={this.props.autoVisible}
        realtime={this.props.realtime}
        listing={this.listing}
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

  onSubscribe = () => this.listing.scope.on(this.onRefresh);
  onUnsubscribe = () => this.listing.scope.off(this.onRefresh);
  getListingParams = (props) => ({ ...pick(LISTING_PROPS, props || this.props) });
  onUpdate = (props) => {
    this.setState({ ids: this.listing.ids.now(this.getListingParams(props || this.props)) || [] });
    this.listing.ids(this.getListingParams(props || this.props))
      .then(idsList => {
        const ids = idsList || [];
        if (ids.join("|") === this.state.ids.join("|")) return;
        this.setState({ ids }, this.props.onDidUpdate);
      }).catch(error => console.error(error.stack || error));
  };
}

export default withRouter(injectState(Listing));
