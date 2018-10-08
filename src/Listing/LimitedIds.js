import React from "react";
import qs from "qs";
import { ListingIds } from "./Ids";

export class ListingLimitedIds extends React.PureComponent {
  static getDerivedStateFromProps(props) {
    const { listingParams = {} } = props;
    const query = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const limit = parseInt(props.limit, 10) || parseInt(query.limit, 10) || 25;
    const count = parseInt(listingParams.count, 10) || 0;
    return { limit, count };
  }

  render() {
    const { children, ...props } = this.props;
    const { limit, count } = this.state;
    return (
      <ListingIds {...props}>
        {({ ids: allIds }) => children({ ids: allIds.slice(count, count+limit), limit, count })}
      </ListingIds>
    );
  }
}
