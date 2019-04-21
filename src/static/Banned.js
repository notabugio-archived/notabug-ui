import React from "react";
import * as R from "ramda";
import { PageHeader } from "/Page/Header";
import { PageName } from "/Page/Tabs";
import { Timestamp } from "/utils/Timestamp";
import isNode from "detect-node";
import { Link } from "/utils";

export const START = 1554091200;
export const END = 1554177600;
export const isBanActive = R.compose(
  !isNode && !!/aftest/.test(window.location.search)
    ? R.always(true)
    : R.identity,
  R.allPass([R.lte(START), R.gte(END)]),
  () => new Date().getTime() / 1000
);

export const Banned = () => (
  <React.Fragment>
    <PageHeader>
      <PageName path={"/"} name="notabug: banned" />
    </PageHeader>
    <div className="content" role="main">
      <div className="interstitial">
        <img
          className="interstitial-image"
          src="/static/img/interstitial-image-banned.png"
          alt="banned"
          height="150"
          width="150"
        />
        <div className="interstitial-message md-container">
          <div className="md">
            <h3>This community has been banned</h3>
            <p>
              This community was banned due to a violation of{" "}
              <a
                href="https://redditblog.com/2007/04/01/reddit-now-doubleplusgood/"
                target="_blank"
                rel="noopener noreferrer"
              >
                reddit content policy
              </a>
              , specifically, the prohibition of content that discourages or
              condemns censorship.
            </p>
            <div className="note">
              Banned <Timestamp created_utc={START} />.
            </div>
          </div>
        </div>
        <div className="buttons">
          <Link
            href="/user/CEyKrDd1xyPXpWSV00MgvnZY2VJLHXgzCvhMeDwKTYA.yjSq0DyXzzhB_ZXr_DzfJgij3tXU0-3t0Q5bJAtZpj8/spaces/frontpage/hot"
            className="c-btn c-btn-primary"
          >
            back to Reddit
          </Link>
        </div>
      </div>
    </div>
  </React.Fragment>
);
