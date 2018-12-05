import React from "react";
import { WikiPageContent } from "Wiki";
import { tabulator } from "../config.json";
import { Link } from "utils";

export const SidebarTitlebox = ({ siteprefix, subreddit, bottom }) => (
  <div className="spacer">
    <div className="titlebox">
      {/*subreddit ? (
        <h1 className="hover redditname">
          <Link className="hover" href={`/${siteprefix}/${subreddit}/`}>{subreddit}</Link>
        </h1>
      ) : null*/}
      <WikiPageContent name="sidebar" identifier={tabulator} />
      <div className="bottom">
        {bottom}
      </div>
      <div className="clear" />
    </div>
  </div>
);
