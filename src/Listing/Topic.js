import qs from "qs";
import { ZalgoPromise as Promise } from "zalgo-promise";
import React, { PureComponent } from "react";
import { SortSelector } from "snew-classic-ui";
import { injectState } from "freactal";
import ChatView from "react-chatview";
import { withRouter } from "react-router-dom";
import { Dropdown, Link, Loading, JavaScriptRequired } from "utils";
import { Submission } from "Submission";
import Listing from "./Listing";

export class Topic extends PureComponent {
  constructor(props) {
    super(props);
    const query = qs.parse(props.location.search.slice(1));
    const limit = parseInt(query.limit, 10) || 25;
    this.state = { limit };
  }

  render() {
    const {
      match: { params: { userid } },
      location: { search, pathname },
      state: { notabugInfiniteScroll: isInfinite },
      listingParams = {},
    } = this.props;
    const { limit } = this.state;
    const query = qs.parse(search.slice(1));
    const count = parseInt(query.count, 10) || 0;
    const listing = {
      listingParams,
      Empty: () => <Loading name="ball-grid-beat" />,
      Loading: Submission,
      noRank: !!userid,
      disableChildren: true,
      fetchParent: true,
    };

    return isInfinite ? (
      <div className="content" role="main">
        <Listing
          {...listing}
          Container={ChatView}
          containerProps={{
            id: "siteTable",
            className: "sitetable infinite-listing",
            scrollLoadThreshold: 800,
            onInfiniteLoad: this.onLoadMore
          }}
        />
      </div>
    ) : (
      <div className="content" role="main">
        {userid ? (
          <SortSelector
            {...{ Dropdown, Link }}
            currentSort={listingParams.sort}
            permalink={pathname}
            sortOptions={["hot", "new", "top", "controversial"]}
          />
        ) : null}
        <div className="sitetable" id="siteTable">
          <Listing {...listing} />
          <div className="nav-buttons">
            <span className="nextprev">
              {"view more: "}
              {(count - limit) >= 0 ? (
                <Link
                  href={`${pathname || "/"}?${qs.stringify({ ...query, count: count - limit })}`}
                >‹ prev</Link>
              ) : null}
              <JavaScriptRequired silent>
                <a onClick={this.onToggleInfinite} href="">∞</a>
              </JavaScriptRequired>
              <Link
                href={`${pathname || "/"}?${qs.stringify({ ...query, count: count + limit })}`}
              >next ›</Link>
            </span>
          </div>
        </div>
      </div>
    );
  }

  onLoadMore = () => Promise.resolve(this.setState({ limit: this.state.limit + 5 }));
  onToggleInfinite = (e) => {
    e.preventDefault();
    this.props.effects.onNotabugToggleInfiniteScroll();
  };
}

export default withRouter(injectState(Topic));
