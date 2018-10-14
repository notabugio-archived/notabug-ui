import React from "react";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { injectState } from "freactal";
import { mergeDeepRight } from "ramda";
import { ListingIds } from "./Ids";

export class NestedIdsProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    const nab = this.props.state.notabugApi;
    this.scope = nab.scope;
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

  onFetchData = ids => {
    const nab = this.props.state.notabugApi;
    return Promise.all(ids.map(id =>
      nab.queries.thingData(this.scope, id).then(data => ({ id, data }))
    )).then(results => {
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
  };

  render () {
    const { children, ...props } = this.props;
    return children({ ...props, replyTree: this.state });
  }
}

export const NestedIds = injectState((({ listingParams, ...props }) => (
  <ListingIds {...{ listingParams }} >
    {state => <NestedIdsProvider {...{ ...state, ...props, listingParams }} />}
  </ListingIds>
)));
