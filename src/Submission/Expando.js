import React from "react";
import qs from "query-string";
import ReactPlayer from "react-player";
import InstagramEmbed from "react-instagram-embed";
import { Markdown } from "/utils";

export const Expando = ({
  expanded,
  url,
  is_self,
  selftext: body,
  selftext_html: html,
  image,
  iframe,
  EmbedComponent,
  isEditing,
  editedBody,
  onChangeEditedBody,
  onToggleEditing,
  onSubmitEdit
}) => (
  <div className="expando">
    {expanded ? (
      is_self && (body || isEditing) ? (
        <form className="usertext warn-on-unload" onSubmit={onSubmitEdit}>
          {isEditing ? (
            <div className="usertext-edit md-container">
              <div className="md">
                <textarea
                  rows="1"
                  cols="1"
                  name="text"
                  value={editedBody}
                  onChange={onChangeEditedBody}
                />
              </div>
              <div className="bottom-area">
                <div className="usertext-buttons">
                  <button type="submit" className="save">
                    save
                  </button>
                  <button type="butotn" onClick={onToggleEditing}>
                    cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Markdown
              body={body}
              html={html}
              className="usertext-body may-blank-within md-container"
            />
          )}
        </form>
      ) : EmbedComponent ? (
        <EmbedComponent.Component {...EmbedComponent.props} key={url} />
      ) : image ? (
        <img src={image} alt="userimage" rel="noreferrer" />
      ) : iframe ? (
        <iframe
          src={iframe}
          title="uservideo"
          height="360"
          width="640px"
          allowFullScreen
          scrolling="no"
          frameborder="0"
        />
      ) : null
    ) : null}
  </div>
);

const matchesExt = (exts, url) =>
  !!exts.find(ext => url.toLowerCase().indexOf("." + ext) !== -1);
const imgExts = ["jpg", "jpeg", "png", "gif"];

export const getExpando = (item, rawDomain, urlInfo) => {
  const domain = rawDomain ? rawDomain.toLowerCase() : rawDomain;
  const query = qs.parse(urlInfo.query);
  let iframe;
  let EmbedComponent;
  let reactPlayer;

  if (ReactPlayer.canPlay(item.url)) {
    reactPlayer = item.url;
  } else if (domain === "hooktube.com") {
    reactPlayer = item.url.replace("hooktube", "youtube");
  } else if (domain === "invidio.us") {
    // reactPlayer = item.url.replace("invidio.us", "youtube.com");
  }

  if (reactPlayer) {
    EmbedComponent = {
      Component: ReactPlayer,
      props: {
        url: reactPlayer,
        controls: true
      }
    };
  }

  if (domain === "instagr.am" || domain === "instagram.com") {
    EmbedComponent = {
      Component: InstagramEmbed,
      props: {
        url: item.url
      }
    };
  }

  if (
    (domain === "imgur.com" || domain === "i.imgur.com") &&
    matchesExt(["gifv"], item.url)
  ) {
    iframe = item.url.replace(".gifv", "/embed");
  } else {
    iframe = findIframe(item, domain, query);
  }

  const image =
    iframe || EmbedComponent
      ? null
      : item.url && matchesExt(imgExts, item.url)
      ? item.url
      : null;

  const expandoType = item.body
    ? "selftext"
    : image || EmbedComponent || iframe
    ? "video"
    : null;

  return { expandoType, image, iframe, reactPlayer, EmbedComponent };
};

const findIframe = (item, domain, query) => {
  if (domain === "bitchute.com" && item.url.indexOf("/video/") !== -1) {
    return (
      "https://www.bitchute.com/embed/" +
      item.url.substring(item.url.indexOf("/video/") + 7, item.url.length)
    );
  }
  if (domain === "d.tube")
    return item.url.replace("d.tube/#!/v", "emb.d.tube/#!");
  if (domain === "invidio.us") return "https://invidio.us/embed/" + query.v;
  if (domain === "dailymotion.com" && item.url.indexOf("/video/") !== -1) {
    return (
      "https://www.dailymotion.com/embed/video/" +
      item.url.substring(item.url.indexOf("/video/") + 7, item.url.length)
    );
  }
  if (domain === "vevo.com" && item.url.indexOf("/watch/") !== -1) {
    return (
      "https://embed.vevo.com?isrc=" +
      item.url.substring(item.url.lastIndexOf("/") + 1, item.url.length)
    );
  }
  if (domain === "gfycat.com" && item.url.indexOf("/detail/") !== -1) {
    return (
      "https://gfycat.com/ifr/" +
      item.url.substring(item.url.indexOf("/detail/") + 8, item.url.length)
    );
  }
  if (domain === "gfycat.com" && item.url.indexOf(".com/") !== -1) {
    return (
      "https://gfycat.com/ifr/" +
      item.url.substring(item.url.indexOf(".com/") + 5, item.url.length)
    );
  }
  if (domain === "giphy.com" && item.url.indexOf("/html5") !== -1) {
    return (
      "https://giphy.com/embed/" +
      item.url
        .substring(item.url.lastIndexOf("/gifs/") + 6, item.url.length)
        .replace("/html5", "")
    );
  }
  if (domain === "giphy.com" && item.url.indexOf("/gifs/") !== -1) {
    return (
      "https://giphy.com/embed/" +
      item.url.substring(item.url.lastIndexOf("-") + 1, item.url.length)
    );
  }
  if (domain === "pornhub.com" && query.viewkey) {
    return `https://www.pornhub.com/embed/${query.viewkey}`;
  }
  if (domain === "liveleak.com") {
    return item.url.replace("/view", "/ll_embed");
  }
  if (domain === "youporn.com") {
    return item.url.replace("/watch", "/embed");
  }
  if (domain === "rutube.ru" && item.url.indexOf("/video/") !== -1) {
    return (
      "https://rutube.ru/play/embed/" +
      item.url.substring(item.url.indexOf("/video/") + 7, item.url.length)
    );
  }
  return null;
};
