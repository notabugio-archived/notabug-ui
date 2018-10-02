import React from "react";
import { injectState } from "freactal";

export class ListingIdsBase extends React.PureComponent {
  constructor(props) {
    super(props);
    const api = props.state.notabugApi;
    const ids = api.queries.listingIds.now(api.scope, props.listingParams.soul) || [];
    console.log("soul", props.listingParams.soul);
    this.state = { ids };
  }

  componentDidMount() {
    this.onUpdate();
    this.onSubscribe();
  }

  render() {
    const { ids } = this.state;
    const { children } = this.props;
    return children({ ids });
  }

  onSubscribe = () => {
    const api = this.props.state.notabugApi;
    api.scope.on(this.onRefresh);
  }

  onRefresh = () => this.onUpdate();

  onUpdate = (props) => {
    const api = (props || this.props).state.notabugApi;
    const soul = (props || this.props).listingParams.soul;
    const ids = (api.queries.listingIds.now(api.scope, soul) || []);
    if (JSON.stringify(ids) === JSON.stringify(this.state.ids)) return;
    this.setState({ ids });
  }
}

export const ListingIds = injectState(ListingIdsBase);
