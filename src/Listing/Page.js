import React from "react";
import qs from "qs";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { withRouter } from "react-router-dom";
import { injectState } from "freactal";
import ChatView from "react-chatview";
import { NavTab as SnewNavTab, SubmitLinkSidebox, SubmitTextSidebox } from "snew-classic-ui";
import { Link, Timestamp, JavaScriptRequired } from "utils";
import { Submission } from "Submission";
import { AuthorLink, UserInfo, LoginFormSide } from "Auth";
import { SidebarTitlebox } from "App/SidebarTitlebox";
import { ListingIds } from "./Ids";
import Listing from "./Listing";
import { PREFIX } from "notabug-peer/util";

const PREFIX_RE = new RegExp(`^${PREFIX}`);

export class Page extends React.PureComponent {
  constructor(props) {
    super(props);
    const query = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const limit = parseInt(query.limit, 10) || 25;
    this.state = { limit };
  }

  renderListing({ includeRanks }) {
    const {
      Loading = Submission,
      Empty = () => <Loading name="ball-grid-beat" />,
      listingParams = {},
      location: { pathname, search },
      state: { notabugInfiniteScroll: isInfinite },
    } = this.props;
    const { limit } = this.state;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const count = parseInt(query.count, 10) || 0;
    const listing = {
      Loading, Empty, limit, realtime: !!isInfinite,
      listingParams: { ...listingParams, count },
      noRank: !includeRanks,
      fetchParent: true,
      disableChildren: true,
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

  render() {
    const {
      match: { params: { identifier="all" } },
      listingParams
    } = this.props;
    const prefix = listingParams.prefix;

    return (
      <ListingIds {...{ listingParams }}>
        {({ name, userId, tabs, submitTopic, includeRanks, createdAt }) => (
          <React.Fragment>
            <div id="header" role="banner">
              <a href="#content" id="jumpToContent" tabIndex={1}>
                jump to content
              </a>
              <div id="header-bottom-left">
                <Link
                  className="default-header"
                  href="/"
                  id="header-img"
                >
                  notabug
                </Link>
                {name ? (
                  <span className="hover pagename redditname">
                    <Link href={`/${prefix}/${identifier}/`}>{name}</Link>
                  </span>
                ) : null}
                {tabs.length ? (
                  <ul className="tabmenu">
                    {tabs.map(tab => (
                      <NavTab
                        key={tab}
                        soul={tab}
                        prefix={prefix}
                        identifier={identifier}
                        listingParams={listingParams}
                      />
                    ))}
                    {userId ? null : <SnewNavTab {...{ Link, href: "/chat" }}>firehose</SnewNavTab>}
                  </ul>
                ) : null}
              </div>
              <UserInfo />
            </div>
            <div className="side">
              {userId ? (
                <React.Fragment>
                  <div className="spacer">
                    <div className="titlebox">
                      <h1>
                        <AuthorLink
                          className=""
                          author={name}
                          author_fullname={userId}
                        />
                      </h1>
                      <div className="bottom">
                        {createdAt ? (
                          <span className="age">
                            created <Timestamp {...{ created_utc:createdAt }} />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <LoginFormSide />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <LoginFormSide />
                  {submitTopic ? (
                    <React.Fragment>
                      <SubmitLinkSidebox siteprefix="t" subreddit={submitTopic} />
                      <SubmitTextSidebox siteprefix="t" subreddit={submitTopic} />
                      <SidebarTitlebox siteprefix="t" subreddit={name} />
                    </React.Fragment>
                  ) : null}
                </React.Fragment>
              )}
            </div>
            <a name="content" key="anchor" />,
            {this.renderListing({ includeRanks })}
            <p className="bottommenu debuginfo" key="debuginfo">,
              <span className="icon">π</span> <span className="content" />
            </p>
          </React.Fragment>
        )}
      </ListingIds>
    );
  }

  onLoadMore = () => Promise.resolve(this.setState(({ limit }) => ({ limit: limit + 25 })));
  onToggleInfinite = (e) => {
    e.preventDefault();
    this.props.effects.onNotabugToggleInfiniteScroll();
  };
}

const NavTab = ({ soul, listingParams }) => {
  const parts = soul.split("@~");
  const pathParts = (parts[0] || "").split("/");
  let href = (parts[0] || "").replace(PREFIX_RE, "");
  let name = pathParts.pop();
  if (listingParams.type) {
    name = pathParts.pop();
  }
  if (listingParams.type) {
    href = href.replace(new RegExp(`/${listingParams.sort}$`), "");
  }
  return (
    <SnewNavTab
      {...{ Link, href }}
      className={soul === listingParams.soul ? "selected" : ""}
    >{name}</SnewNavTab>
  );
};

export default withRouter(injectState(Page));
