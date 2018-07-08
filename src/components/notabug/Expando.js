import React from "react";
import { Markdown } from "./Markdown";

export const Expando = ({
  expanded,
  is_self,
  selftext: body,
  selftext_html: html,
  image,
  video,
  iframe
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
      ) : image ? (
        <img src={image} alt="userimage"></img>
      ) : video ? (
        <video src={video}/>
      ) : iframe ? (
        <iframe src={iframe} title="uservideo" height="320" width="480px"/>
      ) : null
    ) : null}
  </div>
);

const matchesExt = (exts, url) => !!exts.find(ext => url.toLowerCase().indexOf("."+ext) !== -1);

export const getExpando = (item, domain) => {
  const imgExts = ["jpg", "jpeg", "png", "gif", "gifv"];
  const vidExts = ["mp4", "mov", "webm", "ogv", "m4v"];
  const image = (item.url && matchesExt(imgExts, item.url)) ? item.url : null;
  const video = (item.url && matchesExt(vidExts, item.url)) ? item.url
    : (item.url && item.url.indexOf(".gifv") !== -1)
      ? item.url.replace(".gifv",".mp4") : null;

  const iframe = (domain === "youtube.com" && item.url.indexOf("?v=") !== -1) ? "https://www.hooktube.com/embed/" + item.url.substring(item.url.indexOf("?v=")+3, item.url.length) + "?autoplay=0":
  (domain === "youtu.be" && item.url.indexOf(".be/") !== -1) ? "https://www.hooktube.com/embed/" + item.url.substring(item.url.indexOf(".be/")+4, item.url.length) + "?autoplay=0":
  (domain === "hooktube.com" && item.url.indexOf("?v=") !== -1) ? "https://www.hooktube.com/embed/" + item.url.substring(item.url.indexOf("?v=")+3, item.url.length) + "?autoplay=0":
  (domain === "bitchute.com" && item.url.indexOf("/video/") !== -1) ? "https://www.bitchute.com/embed/" + item.url.substring(item.url.indexOf("/video/")+7, item.url.length) :
  (domain === "dailymotion.com" && item.url.indexOf("/video/") !== -1) ? "https://www.dailymotion.com/embed/video/" + item.url.substring(item.url.indexOf("/video/")+7, item.url.length) :
  (domain === "vimeo.com" && item.url.indexOf(".com/") !== -1) ? "https://player.vimeo.com/video/" + item.url.substring(item.url.indexOf(".com/")+5, item.url.length) :
  (domain === "vevo.com" && item.url.indexOf("/watch/") !== -1) ? "https://embed.vevo.com?isrc=" + item.url.substring(item.url.lastIndexOf("/")+1, item.url.length) :
  (domain === "gfycat.com" && item.url.indexOf("/detail/") !== -1) ? "https://gfycat.com/ifr/" + item.url.substring(item.url.indexOf("/detail/")+8, item.url.length) :
  (domain === "gfycat.com" && item.url.indexOf(".com/") !== -1) ? "https://gfycat.com/ifr/" + item.url.substring(item.url.indexOf(".com/")+5, item.url.length) :
  (domain === "giphy.com" && item.url.indexOf("/html5") !== -1) ? "https://giphy.com/embed/" + item.url.substring(item.url.lastIndexOf("/gifs/")+6, item.url.length).replace("/html5","") :
  (domain === "giphy.com" && item.url.indexOf("/gifs/") !== -1) ? "https://giphy.com/embed/" + item.url.substring(item.url.lastIndexOf("-")+1, item.url.length) :
  null;

  return { image, video, iframe };
}
