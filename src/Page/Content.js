import React from "react";
import { ZalgoPromise as Promise } from "zalgo-promise";
import qs from "qs";
import debounce from "lodash/debounce";
import ChatView from "react-chatview";
import { Link, JavaScriptRequired } from "utils";
import { ChatInput } from "Chat";
import { PageFooter } from "Page/Footer";
import { Submission } from "Submission";
import { Listing } from "Listing";

export class Content extends React.PureComponent {
  constructor(props) {
    super(props);
    const query = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const limit = parseInt(query.limit, 10) || 25;
    this.state = { limit, infinite: false };
    this.scrollToBottom = debounce(
      () => {
        if (this.scrollable && !this.state.isScrolling)
          this.scrollable.scrollTop = this.scrollable.scrollHeight;
      },
      100
    );

    this.stoppedScrolling = debounce(() => this.setState({ isScrolling: false }), 5000);
  }

  render(){
    const {
      Loading = Submission,
      Empty = () => <Loading name="ball-grid-beat" />,
      listingParams = {},
      location: { pathname, search },
      isChat,
      submitTopic,
      includeRanks
    } = this.props;
    const { limit, infinite } = this.state;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const count = parseInt(query.count, 10) || 0;
    const listing = {
      Loading, Empty, limit, realtime: !!infinite,
      listingParams: { ...listingParams, count },
      onDidUpdate: isChat ? this.scrollToBottom : null,
      noRank: !includeRanks,
      fetchParent: true,
      disableChildren: true
    };

    return (infinite || isChat) ? (
      <React.Fragment>
        <div className="content" role="main">
          <Listing
            {...listing}
            Container={ChatView}
            containerProps={{
              id: "siteTable",
              className: `sitetable infinite-listing ${isChat ? "chat-listing" : ""}`,
              scrollLoadThreshold: 800,
              onInfiniteLoad: this.onLoadMore,
              flipped: isChat,
              returnScrollable: scrollable => this.scrollable = scrollable,
            }}
          />
          {isChat ? <ChatInput topic={submitTopic || "whatever"} /> : null}
        </div>
      </React.Fragment>
    ) : (
      <React.Fragment>
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
        <PageFooter />
        <p className="bottommenu debuginfo" key="debuginfo">,
          <span className="icon">π</span> <span className="content" />
        </p>
      </React.Fragment>
    );
  }

  onLoadMore = () => Promise
    .resolve(this.setState(({ limit }) => ({ isScrolling: true, limit: limit + 25 })))
    .then(this.stoppedScrolling);
  onToggleInfinite = (e) => {
    e.preventDefault();
    this.setState({ infinite: !this.state.infinite });
  };
}
