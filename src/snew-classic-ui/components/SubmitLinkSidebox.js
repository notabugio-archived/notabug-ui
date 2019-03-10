import React from "react";
import LinkComponent from "./Link";

const SubmitLinkSidebx = ({
  Link = LinkComponent,
  siteprefix = "r",
  subreddit
}) => (
  <div className="spacer">
    <div className="sidebox submit submit-link">
      <div className="morelink">
        <Link
          className="login-required access-required"
          data-event-action="submit"
          data-event-detail="link"
          data-type="subreddit"
          href={(subreddit && subreddit !== "all")
            ? `/${siteprefix}/${subreddit}/submit`
            : "/submit"}
        >
          Submit a new link
        </Link>
        <div className="nub" />
      </div>
    </div>
  </div>
);

export default SubmitLinkSidebx;

