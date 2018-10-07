import React from "react";
import LoadingComponent from "./Loading";
import OrganicListingComponent from "./OrganicListing";
import SiteTableComponent from "./SiteTable";
import CommentAreaComponent from "./CommentArea";
import MarkdownComponent from "./Markdown";
import { optional } from "../util";

const getProp = (listings, prop) => (
  listings &&
  listings[0] &&
  listings[0].allChildren &&
  listings[0].allChildren.length === 1 &&
  listings[0].allChildren[0] &&
  listings[0].allChildren[0].data &&
  listings[0].allChildren[0].data[prop]
);

const isArchived = (listings) => !!getProp(listings, "archived");
const isLocked = (listings) => !!getProp(listings, "locked") || isArchived(listings);

const Content = ({
  OrganicListing = OrganicListingComponent,
  SiteTable = SiteTableComponent,
  CommentArea = CommentAreaComponent,
  Loading = LoadingComponent,
  Markdown = MarkdownComponent,
  bodyClassName="listing-page",
  isLoading,
  listings,
  ...props
}) =>
  isLoading ? <Loading /> : (
    <div className="content" role="main" >
      {/*(isCommentsPage(listings) && [
        <ReactBody className="single-page comments-page" key="comments-page" />,
        flairClass(listings) && (
          <ReactBody className={`post-linkflair-${flairClass(listings)}`} key="comments-page-flair" />
        )
      ]) || <ReactBody className={bodyClassName} />*/}
      {isArchived(listings) && (
        <div className="reddit-infobar md-container-small with-icon archived-infobar">
          <div className="md"><p>This is an archived post. You won't be able to vote or comment.</p></div>
        </div>
      )}
      {isLocked(listings) && !isArchived(listings) && (
        <div className="reddit-infobar md-container-small with-icon locked-infobar">
          <div className="md"><p>This post is locked. You won't be able to comment.</p></div>
        </div>
      )}
      {optional(OrganicListing, {})}
      <div className="spacer">
        {listings && listings[0] && listings[0].content_md ? [
          <Markdown
            key="wiki-markdown"
            className="wiki-page-content md-container"
            body={listings[0].content_md}
            html={listings[0].content_html}
          />
        ] : (listings || [])[0] ? (
          optional(SiteTable, {
            className: "linklisting",
            expanded: !!listings[1],
            noNav: !!listings[1],
            ...props,
            ...listings[0]
          })
        ): null}
        {(listings || [])[1] ? (
          optional(CommentArea, { ...props, linkListing: listings[0], ...listings[1], locked: isLocked(listings) })
        ): null}
      </div>
    </div>
  );

export default Content;
