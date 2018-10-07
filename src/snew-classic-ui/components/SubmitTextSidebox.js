import React from "react";
import LinkComponent from "./Link";

const SubmitTextSidebox = ({
  Link = LinkComponent,
  siteprefix="r",
  subreddit
}) => (
  <div className="spacer">
    <div className="sidebox submit submit-text">
      <div className="morelink">
        <Link
          className="login-required access-required"
          data-event-action="submit"
          data-event-detail="self"
          data-type="subreddit"
          href={(subreddit && subreddit !== "all")
            ? `/${siteprefix}/${subreddit}/submit?selftext=true`
            : "/submit?selftext=true"}
        >
          Submit a new text post
        </Link>
        <div className="nub" />
      </div>
    </div>
  </div>
);

export default SubmitTextSidebox;

