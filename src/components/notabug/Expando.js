import React from "react";
import { Markdown } from "./Markdown";
import qs from "qs";
import ReactPlayer from "react-player";

export const Expando = ({
  expanded,
  is_self,
  selftext: body,
  selftext_html: html,
  image,
  video,
  iframe,
  reactPlayer
}) => (
  <div className="expando">
    {expanded ? (
      is_self && body ? (
        <form className="usertext warn-on-unload">
          <Markdown
            body={body}
            html={html}
            className="usertext-body may-blank-within md-container"
          />
        </form>
      ) : reactPlayer ? (
        <ReactPlayer url={reactPlayer} controls />
      ) : image ? (
        <img src={image} alt="userimage"></img>
      ) : iframe ? (
        <iframe src={iframe} title="uservideo" height="320" width="480px" frameborder="0" />
      ) : null
    ) : null}
  </div>
);

const matchesExt = (exts, url) => !!exts.find(ext => url.toLowerCase().indexOf("."+ext) !== -1);

export const getExpando = (item, domain, urlInfo) => {
  const imgExts = ["jpg", "jpeg", "png", "gif", "gifv"];
  const image = (item.url && matchesExt(imgExts, item.url)) ? item.url : null;
  const query = qs.parse((urlInfo.search || "?").slice(1));
  let reactPlayer;

  if (ReactPlayer.canPlay(item.url)) {
    reactPlayer = item.url;
  } else if (domain === "hooktube.com") {
    reactPlayer = item.url.replace("hooktube", "youtube");
  }

  const iframe = (domain === "youtube.com" && query.v)
    ? "https://www.hooktube.com/embed/" + query.v + "?autoplay=0&t=" + query.t
    : (domain === "bitchute.com" && item.url.indexOf("/video/") !== -1) ? "https://www.bitchute.com/embed/" + item.url.substring(item.url.indexOf("/video/")+7, item.url.length)
    : (domain === "dailymotion.com" && item.url.indexOf("/video/") !== -1) ? "https://www.dailymotion.com/embed/video/" + item.url.substring(item.url.indexOf("/video/")+7, item.url.length)
    : (domain === "vevo.com" && item.url.indexOf("/watch/") !== -1) ? "https://embed.vevo.com?isrc=" + item.url.substring(item.url.lastIndexOf("/")+1, item.url.length)
    : (domain === "gfycat.com" && item.url.indexOf("/detail/") !== -1) ? "https://gfycat.com/ifr/" + item.url.substring(item.url.indexOf("/detail/")+8, item.url.length)
    : (domain === "gfycat.com" && item.url.indexOf(".com/") !== -1) ? "https://gfycat.com/ifr/" + item.url.substring(item.url.indexOf(".com/")+5, item.url.length)
    : (domain === "giphy.com" && item.url.indexOf("/html5") !== -1) ? "https://giphy.com/embed/" + item.url.substring(item.url.lastIndexOf("/gifs/")+6, item.url.length).replace("/html5","")
    : (domain === "giphy.com" && item.url.indexOf("/gifs/") !== -1) ? "https://giphy.com/embed/" + item.url.substring(item.url.lastIndexOf("-")+1, item.url.length) : null;

  return { image, iframe, reactPlayer };
};
