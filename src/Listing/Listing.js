import React, { PureComponent, Fragment } from "react";
import debounce from "lodash/debounce";
import { injectState } from "freactal";
import { withRouter } from "react-router-dom";
import { Thing } from "./Thing";

export class Listing extends PureComponent {
  constructor(props) {
    super(props);
    this.listing = props.listing || props.state.notabugApi.scopedListing();
    if (props.realtime) this.listing.scope.realtime();
    this.state = { ids: this.listing.ids.now(props.listingParams) || [] };
    this.onRefresh = debounce(() => this.onUpdate(), 250);
  }

  componentDidMount() {
    this.onUpdate();
    this.onSubscribe();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.listingParams) !== JSON.stringify(nextProps.listingParams))
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
        listingParams={this.props.listingParams}
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
  onUpdate = (props) => {
    const { listingParams } = (props || this.props);
    this.setState({ ids: this.listing.ids.now(listingParams) || [] });
    this.listing.ids(listingParams)
      .then(idsList => {
        const ids = idsList || [];
        if (ids.join("|") === this.state.ids.join("|")) return;
        this.setState({ ids }, this.props.onDidUpdate);
      }).catch(error => console.error(error.stack || error));
  };
}

export default withRouter(injectState(Listing));
