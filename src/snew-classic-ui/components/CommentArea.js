import React from "react";
import LinkComponent from "./Link";
import CommentAreaTitleComponent from "./CommentAreaTitle";
import NestedListingComponent from "./NestedListing";
import SortSelectorComponent from "./SortSelector";

const CommentArea = ({
  Link = LinkComponent,
  NestedListing = NestedListingComponent,
  CommentAreaTitle = CommentAreaTitleComponent,
  SortSelector = SortSelectorComponent,
  hideSortOptions="true",
  currentSort="best",
  sortOptions=[
    "best",
    "top",
    "new",
    "controversial",
    "old",
    "random",
    "q&a"
  ],
  name,
  replyTo,
  num_comments,
  commentsTitle,
  permalink,
  locked,
  allChildren,
  ...props
}) => (
  <div className="commentarea">
    <CommentAreaTitle {...{ num_comments, commentsTitle }} />
    <SortSelector {...{ ...props, currentSort, sortOptions, hideSortOptions }} />
    <NestedListing className="nestedlisting" {...{ ...props, name, replyTo, allChildren, showReplyForm: !locked, locked }} />
    <div className="gold-wrap cloneable-comment">
      <h1 className="gold-banner">
        <Link href="/gold">reddit gold</Link>
      </h1>
      <div className="fancy">
        <div className="fancy-inner">
          <div className="fancy-content">
            <div className="gold-form gold-payment">
              <button className="close-button">close</button>
              <div className="container">
                <h2 className="sidelines">
                  <span>In Summation</span>
                </h2>
                <div className="transaction-summary">
                  <p>
                    Want to say thanks to <em>%(recipient)s</em> for this
                    comment? Give them a month of{" "}
                    <Link href="/gold/about">reddit gold</Link>.
                  </p>
                  <div>
                    <blockquote>
                      <p>
                        By purchasing Reddit Gold, you agree to the{" "}
                        <Link href="/help/useragreement">Reddit User Agreement.</Link>
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
              <ul className="indent">
                <li>
                  <input
                    defaultChecked
                    id="signed-false"
                    name="signed"
                    type="checkbox"
                  />make my gift anonymous
                </li>
                <li>
                  <input id="message" name="message" type="checkbox" />include a
                  message
                </li>
                <li>
                  <textarea
                    className="hidden giftmessage"
                    cols={50}
                    id="giftmessage"
                    maxLength={500}
                    name="giftmessage"
                    placeholder="enter your message"
                    rows={3}
                    defaultValue={""}
                  />
                </li>
              </ul>
              <div className="buttons">
                <p>Please select a payment method.</p>
                <div className="note">
                  <p>
                    Give gold often? Consider{" "}
                    <Link href="/creddits">buying creddits to use</Link>, they're 40%
                    cheaper if purchased in a set of 12.
                  </p>
                  <p>
                    Would you like to{" "}
                    <Link href="/gilding">learn more about giving gold</Link>?
                  </p>
                </div>
              </div>
              <div className="throbber" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="gold-wrap cloneable-link">
      <h1 className="gold-banner">
        <Link href="/gold">reddit gold</Link>
      </h1>
      <div className="fancy">
        <div className="fancy-inner">
          <div className="fancy-content">
            <div className="gold-form gold-payment">
              <button className="close-button">close</button>
              <div className="container">
                <h2 className="sidelines">
                  <span>In Summation</span>
                </h2>
                <div className="transaction-summary">
                  <p>
                    Want to say thanks to <em>%(recipient)s</em> for this
                    submission? Give them a month of{" "}
                    <Link href="/gold/about">reddit gold</Link>.
                  </p>
                  <div>
                    <blockquote>
                      <p>
                        By purchasing Reddit Gold, you agree to the{" "}
                        <Link href="/help/useragreement">Reddit User Agreement.</Link>
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
              <ul className="indent">
                <li>
                  <input
                    defaultChecked
                    id="signed-false"
                    name="signed"
                    type="checkbox"
                  />make my gift anonymous
                </li>
                <li>
                  <input id="message" name="message" type="checkbox" />include a
                  message
                </li>
                <li>
                  <textarea
                    className="hidden giftmessage"
                    cols={50}
                    id="giftmessage"
                    maxLength={500}
                    name="giftmessage"
                    placeholder="enter your message"
                    rows={3}
                    defaultValue={""}
                  />
                </li>
              </ul>
              <div className="buttons">
                <p>Please select a payment method.</p>
                <div className="note">
                  <p>
                    Give gold often? Consider{" "}
                    <Link href="/creddits">buying creddits to use</Link>, they're 40%
                    cheaper if purchased in a set of 12.
                  </p>
                  <p>
                    Would you like to{" "}
                    <Link href="/gilding">learn more about giving gold</Link>?
                  </p>
                </div>
              </div>
              <div className="throbber" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CommentArea;

