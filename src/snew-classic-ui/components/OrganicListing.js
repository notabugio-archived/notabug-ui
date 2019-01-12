/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import LinkComponent from "./Link";

const OrganicListing = ({ Link = LinkComponent }) => (
  <div className="spacer">
    <div className="organic-listing loading" id="siteTable_organic">
      <div className="help help-hoverable">
        what's this?
        <div
          className="hover-bubble help-bubble anchor-top"
          id="spotlight-help"
        >
          <div className="help-section help-promoted">
            <p>
              This sponsored link is an advertisement generated with our{" "}
              <Link href="https://www.reddit.com/wiki/selfserve">
                self-serve advertisement tool
              </Link>.
            </p>
            <p>
              Use of this tool is open to all members of reddit.com, and for as
              little as $5.00 you can advertise in this area.{" "}
              <a href="/advertising">Get started ›</a>
            </p>
          </div>
          <div className="help-section help-organic">
            <p>
              This area shows new and upcoming links. Vote on links here to help
              them become popular, and click the forwards and backwards buttons
              to view more.
            </p>
            <form action="#" className="toggle disable_ui-button" method="get">
              <input
                name="executed"
                type="hidden"
                defaultValue="This element has been disabled."
              />
              <input name="id" type="hidden" defaultValue="organic" />
              <span className="option main active">
                Click <a className="togglebutton access-required">here</a> to disable this feature.
              </span>
              <span className="option error">
                are you sure? <a className="yes">yes</a>
                {" / "}
                <a className="no">no</a>
              </span>
            </form>
          </div>
          <div className="help-section help-interestbar">
            <p>
              Enter a keyword or topic to discover new subreddits around your
              interests. Be specific!
            </p>
            <p>
              You can access this tool at any time on the{" "}
              <a href="/subreddits/">/subreddits/</a> page.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default OrganicListing;

