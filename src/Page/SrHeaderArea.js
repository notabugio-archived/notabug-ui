import React from "react";
import { Link } from "utils";

const HEADER_TOPICS = [
  "art",
  "ask",
  "books",
  "food",
  "funny",
  "gaming",
  "gifs",
  "movies",
  "music",
  "news",
  "pics",
  "politics",
  "programming",
  "quotes",
  "science",
  "space",
  "technology",
  "travel",
  "tv",
  "videos",
  "whatever"
];

export const SrHeaderArea = () => (
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
              <Link className="choice" href={`/t/${topic}`}>{topic}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
