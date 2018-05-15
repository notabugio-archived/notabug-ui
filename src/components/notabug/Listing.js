import React, { PureComponent, Fragment } from "react";
import { listing as getListing } from "lib/nab/read";
import { Thing } from "./Thing";

export class Listing extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { listing: props.listing, ids: [] };
    this.onUpdate = this.onUpdate.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  componentDidMount() {
    const { threshold = -Infinity, myContent={} } = this.props;
    const listing = this.props.listing || getListing(
      this.props.gunChain,
      threshold
    );
    const ids = listing.ids(this.props.sort, threshold, myContent);
    listing.on(this.onRefresh);
    this.setState({ listing, ids }, this.onRefresh);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listing && nextProps.listing !== this.state.listing) {
      this.state.listing && this.state.listing.off();
      this.setState({ listing: nextProps.listing }, () => {
        nextProps.listing.on(this.onRefresh);
        this.onUpdate();
      });
    } else if (nextProps.sort !== this.props.sort) {
      this.onUpdate(nextProps);
    }
  }

  componentWillUnmount() {
    this.state.listing && this.state.listing.off();
  }

  render() {
    const { listing } = this.state;
    const { myContent = {}, Empty } = this.props;
    const count = parseInt(this.props.count, 10) || 0;
    let ids;

    if (!this.state.ids.length && Empty) return <Empty />;

    if (this.props.limit) {
      const start = this.props.count || 0;
      ids = this.state.ids.slice(start, start+this.props.limit);
    } else {
      ids = this.state.ids;
    }

    return (
      <Fragment>
        {ids.map((id, idx) =>(
          <Thing
            id={id}
            key={id}
            listing={listing}
            isMine={!!myContent[id]}
            rank={count + idx + 1}
            collapseThreshold={this.props.collapseThreshold}
          />
        ))}
      </Fragment>
    );
  }

  onSubscribe() {
    this.state.listing && this.state.listing.on(this.onRefresh);
  }

  onUpdate(props) {
    props = props || this.props;
    const { listing } = this.state;
    const { threshold = -Infinity, myContent = {} } = props;
    if (!listing) return;
    const ids = listing.ids(props.sort, threshold, myContent);
    this.setState({ listing, ids });
  }

  onRefresh() {
    this.onUpdate();
  }
}
