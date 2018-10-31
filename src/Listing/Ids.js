import React from "react";
import { injectState } from "freactal";
import { SOUL_DELIMETER } from "notabug-peer/util";
import debounce from "lodash/debounce";

export class ListingIdsBase extends React.PureComponent {
  constructor(props) {
    super(props);
    const api = props.state.notabugApi;
    const state = api.queries.listing.now(api.scope, props.listingParams.soul) || {};
    this.state = { ...state };
    this.onRefresh = debounce(() => this.onUpdate(), 50);
  }

  componentDidMount() {
    this.onUpdate();
    this.onSubscribe();
  }

  render() {
    const {
      ids: idString,
      tabs: tabString,
      curators: curatorsString,
      censors: censorsString,
      includeRanks: includeRanksString,
      isChat: isChatString,
      ...state
    } = this.state;
    const { children } = this.props;
    const includeRanks = includeRanksString && includeRanksString !== "false" && includeRanksString !== "0";
    const isChat = isChatString && isChatString !== "false" && isChatString !== "0";
    const ids = (idString || "").split("+").filter(x => !!x);
    const tabs = (tabString || "").split(SOUL_DELIMETER).filter(x => !!x);
    const curators = (curatorsString || "").split(SOUL_DELIMETER).filter(x => !!x);
    const censors = (censorsString || "").split(SOUL_DELIMETER).filter(x => !!x);
    const createdAt = parseInt(state.createdAt, 10);
    return children({ ...state, ids, tabs, curators, censors, includeRanks, isChat, createdAt });
  }

  onSubscribe = () => this.props.state.notabugApi.scope.on(this.onRefresh);

  onUpdate = (props) => {
    const api = (props || this.props).state.notabugApi;
    const soul = (props || this.props).listingParams.soul;
    this.setState(api.queries.listing.now(api.scope, soul) || {});
  }
}

export const ListingIds = injectState(ListingIdsBase);
