import React from "react";
import LinkComponent from "./Link";
import NavTabComponent from "./NavTab";

const getProp = (listings, prop) => (
  listings &&
  listings[0] &&
  listings[0].allChildren &&
  listings[0].allChildren.length === 1 &&
  listings[0].allChildren[0] &&
  listings[0].allChildren[0].data &&
  listings[0].allChildren[0].data[prop]
);
const isCommentsPage = (listings) => listings && listings[1];
const getPermalink = (listings) => getProp(listings, "permalink");
const getDupesLink = (listings) => getPermalink(listings) && getPermalink(listings).replace("/comments/", "/duplicates/");

const HeaderBottomLeft = ({
  Link = LinkComponent,
  NavTab = NavTabComponent,
  subreddit="all",
  siteprefix="r",
  subredditData,
  useStyle,
  listings,
  numOtherDiscussions,
  ...props
}) => (
  <div id="header-bottom-left">
    {useStyle && subredditData && subredditData.header_img ? (
      <Link href="/">
        <img
          id="header-img"
          src={subredditData.header_img}
          alt={subredditData.display_name}
        />
      </Link>
    ) : (
      <Link
        className="default-header"
        href="/"
        id="header-img"
      >
        snew
      </Link>
    )} {subreddit ? <span className="hover pagename redditname">
      <Link href={`/${siteprefix}/${subreddit}/`}>{subreddit}</Link>
    </span> : null}
    {isCommentsPage(listings) ? (
      <ul className="tabmenu">
        <NavTab href={getPermalink(listings)} {...{ Link, ...props }}>comments</NavTab>
        <NavTab href={getDupesLink(listings)} {...{ Link, ...props }}>
          other discussions
          {numOtherDiscussions && `(${numOtherDiscussions})`}
        </NavTab>
      </ul>
    ) : (
      <ul className="tabmenu">
        <NavTab href={subreddit ? `/${siteprefix}/${subreddit}/` : "/"} {...{ Link }}>hot</NavTab>
        <NavTab href={subreddit ? `/${siteprefix}/${subreddit}/new/` : "/new/"} {...{ Link }}>new</NavTab>
        <NavTab href={subreddit ? `/${siteprefix}/${subreddit}/rising/` : "/rising/"} {...{ Link }}>rising</NavTab>
        <NavTab href={subreddit ? `/${siteprefix}/${subreddit}/controversial/` : "/controversial/"} {...{ Link }}>controversial</NavTab>
        <NavTab href={subreddit ? `/${siteprefix}/${subreddit}/top/` : "/top/"} {...{ Link }}>top</NavTab>
        <NavTab href={subreddit ? `/${siteprefix}/${subreddit}/gilded/` : "/gilded/"} {...{ Link }}>gilded</NavTab>
      </ul>
    )}
  </div>
);

export default HeaderBottomLeft;

