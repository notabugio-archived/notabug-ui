import React from "react";
import qs from "qs";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { withRouter } from "react-router-dom";
import { injectState } from "freactal";
import ChatView from "react-chatview";
import { Subreddit } from "snew-classic-ui";
import { NavTab as SnewNavTab } from "snew-classic-ui";
import { Link, JavaScriptRequired } from "utils";
import { Submission } from "Submission";
import { UserInfo, LoginFormSide } from "Auth";
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

  renderListing() {
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
      match: { params: { prefix="t", identifier="all" } },
      listingParams, state: { notabugUser }
    } = this.props;
    return (
      <ListingIds {...{ listingParams }}>
        {({ name, tabs }) => (
          <Subreddit
            {...{ Link, LoginFormSide, SidebarTitlebox, UserInfo, NavTab }}
            nabHeader={{ name, tabs, identifier, prefix, listingParams }}
            FooterParent={() => null}
            SidebarSearch={() => null}
            RecentlyViewedLinks={() => null}
            AccountActivityBox={() => null}
            Timestamp={() => null}
            SrHeaderArea={() => null}
            HeaderBottomLeft={HeaderBottomLeft}
            siteprefix={"t"}
            username={notabugUser}
            isShowingCustomStyleOption={false}
          >
            {this.renderListing()}
          </Subreddit>
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

const HeaderBottomLeft = ({
  nabHeader: {
    name,
    prefix,
    identifier,
    listingParams,
    tabs
  }
}) => (
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
        <SnewNavTab {...{ Link, href: `/${prefix}/${identifier}/chat` }}>firehose</SnewNavTab>
      </ul>
    ) : null}
  </div>
);

const NavTab = ({ soul, listingParams }) => {
  const parts = soul.split("@~");
  const href = (parts[0] || "").replace(PREFIX_RE, "");
  const name = (parts[0] || "").split("/").pop();
  return (
    <SnewNavTab
      {...{ Link, href }}
      className={soul === listingParams.soul ? "selected" : ""}
    >{name}</SnewNavTab>
  );
};

export default withRouter(injectState(Page));
