import React from "react";
import LinkComponent from "./Link";

const SidebarSearch = ({
  Link = LinkComponent,
  subreddit
}) => (
  <div className="spacer">
    <form action={subreddit ? `/r/${subreddit}/search` : "/search"} id="search" role="search" method="GET">
      <input name="q" placeholder="search" tabIndex={20} type="text" />
      <input tabIndex={22} type="submit" value="" />
      <div className="infobar" id="searchexpando">
        <label>
          <input name="restrict_sr" tabIndex={21} type="checkbox" defaultChecked />limit my
          search to /r/pics
        </label>
        <div id="moresearchinfo">
          <p>use the following search parameters to narrow your results:</p>
          <dl>
            <dt>
              subreddit:<i>subreddit</i>
            </dt>
            <dd>find submissions in "subreddit"</dd>
            <dt>
              author:<i>username</i>
            </dt>
            <dd>find submissions by "username"</dd>
            <dt>
              site:<i>example.com</i>
            </dt>
            <dd>find submissions from "example.com"</dd>
            <dt>
              url:<i>text</i>
            </dt>
            <dd>search for "text" in url</dd>
            <dt>
              selftext:<i>text</i>
            </dt>
            <dd>search for "text" in self post contents</dd>
            <dt>self:yes (or self:no)</dt>
            <dd>include (or exclude) self posts</dd>
            <dt>nsfw:yes (or nsfw:no)</dt>
            <dd>include (or exclude) results marked as NSFW</dd>
          </dl>
          <p>
            e.g. <code>subreddit:aww site:imgur.com dog</code>
          </p>
          <p>
            <Link href="/wiki/search">
              see the search faq for details.
            </Link>
          </p>
        </div>
        <p>
          <Link href="/wiki/search" id="search_showmore">
            advanced search: by author, subreddit...
          </Link>
        </p>
      </div>
    </form>
  </div>
);

export default SidebarSearch;

