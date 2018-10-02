import React from "react";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { injectState } from "freactal";
import { mergeDeepRight } from "ramda";
import { ListingIds } from "./Ids";

export class NestedIdsProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    const listing = props.listing || props.state.notabugApi.scopedListing();
    this.listing = listing;
    let state;
    this.onFetchData(props.ids).then(updates => state = updates);
    this.state = state || {};
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.ids.length !== this.props.ids.length ||
      this.props.ids.find((val, idx) => val !== nextProps.ids[idx])
    ) this.onFetchData(nextProps.ids);
  }

  onFetchData = ids =>
    Promise.all(ids.map(id => this.listing.thingData(id).then(data => ({ id, data }))))
      .then(results => {
        const updates = results.reduce((r, { id, data }) => {
          const { replyToId, opId } = data || {};
          const parentId = replyToId || opId;
          if (!parentId) return r;
          const replies = r[parentId] = r[parentId] || {};
          replies[id] = data;
          return r;
        }, {});
        this.setState(state => mergeDeepRight(state, updates));
        return updates;
      });

  render () {
    const { children, ...props } = this.props;
    return children({ ...props, replyTree: this.state });
  }
}

export const NestedIds = injectState((({ listingParams, ...props }) => (
  <ListingIds {...{ listingParams }} >
    {({ ids }) => <NestedIdsProvider {...{ ...props, ids, listingParams }} />}
  </ListingIds>
)));
