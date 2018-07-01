/* globals Promise */
import React, { PureComponent } from "react";
import ChatView from "react-chatview";
import { Listing } from "./Listing";
import { Submission } from "./Submission";
import { withRouter, Link } from "react-router-dom";
import { Loading } from "./Loading";
import { injectState } from "freactal";
import qs from "qs";

const Empty = () => <Loading name="ball-grid-beat" />;

const DEF_THRESHOLD = (window && window.location && window.location.search)
  ? parseInt(qs.parse(window.location.search).threshold, 10) || 1 : 1;

class TopicBase extends PureComponent {
  constructor(props) {
    super(props);
    const query = qs.parse(props.location.search.slice(1));
    const limit = parseInt(query.limit, 10) || 25;

    this.state = {
      isInfinite: false,
      limit
    };

    this.onLoadMore = this.onLoadMore.bind(this);
    this.onToggleInfinite = this.onToggleInfinite.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.search !== this.props.location.search ||
      nextProps.match.params.sort !== this.props.match.params.sort ||
      nextProps.match.params.topic !== this.props.match.params.topic ||
      nextProps.match.params.domain !== this.props.match.params.domain
    ) {
      const query = qs.parse(nextProps.location.search.slice(1));
      const limit = parseInt(query.limit, 10) || 25;
      this.setState({ limit });
    }
  }

  render() {
    const {
      match: { params: { sort, topic="all", domain } },
      location: { search, pathname },
      state: { notabugInfiniteScroll: isInfinite }
    } = this.props;
    const { limit } = this.state;
    const query = qs.parse(search.slice(1));
    const count = parseInt(query.count, 10) || 0;

    const listing = {
      Empty,
      Loading: Submission,
      key: `${topic}/${domain}/${sort}`,
      sort: sort || "hot",
      topics: [topic.toLowerCase()],
      days: (sort === "top" || sort === "comments") ? 30 : (sort ==="active" || sort === "new") ? 7 : 30,
      threshold: (sort === "new" || sort === "controversial") ? null : DEF_THRESHOLD,
      realtime: sort === "new" || sort === "active",
      autoVisible: true,
      domain,
      limit,
      count
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
          <Listing {...listing} />
          <div className="nav-buttons">
            <span className="nextprev">
              {"view more: "}
              {(count - limit) >= 0 ? (
                <Link
                  to={`${pathname || "/"}?${qs.stringify({ ...query, count: count - limit })}`}
                >‹ prev</Link>
              ) : null}
              <a onClick={this.onToggleInfinite} href="">∞</a>
              <Link
                to={`${pathname || "/"}?${qs.stringify({ ...query, count: count + limit })}`}
              >next ›</Link>
            </span>
          </div>
        </div>
      </div>
    );
  }

  onLoadMore() {
    return Promise.resolve(this.setState({ limit: this.state.limit + 5 }));
  }

  onToggleInfinite(e) {
    e.preventDefault();
    this.props.effects.onNotabugToggleInfiniteScroll();
  }
}

export const Topic = withRouter(injectState(TopicBase));
