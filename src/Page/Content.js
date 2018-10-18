import React from "react";
import Promise from "promise";
import qs from "qs";
import ChatView from "react-chatview";
import { Link, JavaScriptRequired } from "utils";
import { Submission } from "Submission";
import { Listing } from "Listing";

export class Content extends React.PureComponent {
  constructor(props) {
    super(props);
    const query = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const limit = parseInt(query.limit, 10) || 25;
    this.state = { limit, infinite: false };
  }

  render(){
    const {
      Loading = Submission,
      Empty = () => <Loading name="ball-grid-beat" />,
      listingParams = {},
      location: { pathname, search },
      includeRanks
    } = this.props;
    const { limit, infinite } = this.state;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const count = parseInt(query.count, 10) || 0;
    const listing = {
      Loading, Empty, limit, realtime: !!infinite,
      listingParams: { ...listingParams, count },
      noRank: !includeRanks,
      fetchParent: true,
      disableChildren: true,
    };

    return infinite ? (
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
        <div className="sitetable" id="siteTable">
          <Listing {...listing }>
            {({ ids }) =>
              ((count - limit) >= 0 || ids.length >= limit) ? (
                <div className="nav-buttons" key="navigation">
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
              ) : null
            }
          </Listing>
        </div>
      </div>
    );
  }

  onLoadMore = () => Promise.resolve(this.setState(({ limit }) => ({ limit: limit + 25 })));
  onToggleInfinite = (e) => {
    e.preventDefault();
    this.setState({ infinite: !this.state.infinite });
  };
}
