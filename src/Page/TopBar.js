import React from "react";
import { Link } from "/utils";
import { Config } from "@notabug/peer";

const HEADER_TOPICS = [
  "art",
  "ask",
  "books",
  "domains",
  "food",
  "funny",
  "gaming",
  "gifs",
  "history",
  "memes",
  "movies",
  "music",
  "news",
  "pics",
  "politics",
  "programming",
  "religion",
  "quotes",
  "science",
  "space",
  "technology",
  "travel",
  "tv",
  "videos",
  "whatever"
];

export const TopBar = () => (
  <div id="sr-header-area">
    <div className="width-clip">
      <div className="sr-list">
        <ul className="flat-list sr-bar hover">
          <li>
            <span className="separator">-</span>
            <Link className="random" href="/t/all">
              all
            </Link>
          </li>
          <li>
            <span className="separator">-</span>
            <Link
              className="choice"
              href={`/user/${Config.owner}/spaces/spaces`}
            >
              spaces
            </Link>
          </li>
          <li>
            <span className="separator">-</span>
            <Link className="choice" href="/">
              frontpage
            </Link>
          </li>
          <li>
            <span className="separator">-</span>
            <Link className="choice" href="/t/notabug">
              notabug
            </Link>
          </li>
        </ul>
        <span className="separator"> | </span>
        <ul className="flat-list sr-bar hover">
          <li>Topics:</li>
          {HEADER_TOPICS.sort().map(topic => (
            <li key={topic}>
              <span className="separator">-</span>
              <Link className="choice" href={`/t/${topic}`}>
                {topic}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
