import React from "react";

const RecentlyViewedLinks = () => (
  <div className="spacer">
    <div className="sidecontentbox">
      <div className="title">
        <h1>RECENTLY VIEWED LINKS</h1>
      </div>
      <ul className="content">
        <li>
          <div className="gadget">
            <div className="click-gadget">
              <div>
                <div className="reddit-link even first-half thing id-t5_m">
                  <div className="midcol unvoted">
                    <div
                      aria-label="upvote"
                      className="arrow up login-required access-required"
                      data-event-action="upvote"
                      role="button"
                      tabIndex={0}
                    />
                    <div
                      aria-label="downvote"
                      className="arrow down login-required access-required"
                      data-event-action="downvote"
                      role="button"
                      tabIndex={0}
                    />
                  </div>
                  <div className="reddit-entry entry unvoted">
                    <a
                      className="reddit-link-title may-blank"
                    >
                      NOT SUPPORTED YET
                    </a>
                    <br />
                    <small>
                      <span className="score dislikes">0 points</span>
                      <span className="score unvoted">0 points</span>
                      <span className="score likes">0 points</span> |
                      <a className="reddit-comment-link may-blank" >
                        0 comments
                      </a>
                    </small>
                  </div>
                  <div className="reddit-link-end" />
                </div>
              </div>
            </div>
            <div className="right">
              <a>clear</a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
);

export default RecentlyViewedLinks;

