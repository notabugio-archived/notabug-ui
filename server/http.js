import path from "path";
import express from "express";
import expressStaticGzip from "express-static-gzip";
import expires from "express-cache-headers";
import init from "./notabug-peer";

const staticMedia = express.Router();
staticMedia.use(
  "/media",
  expires({ ttl: 60 * 60 * 24 }),
  expressStaticGzip(path.join(__dirname, "..", "htdocs", "media"), {
    index: false
  })
);
staticMedia.use(
  "/static",
  expires({ ttl: 60 * 60 * 24 }),
  expressStaticGzip(path.join(__dirname, "..", "htdocs", "static"), {
    index: false
  })
);
staticMedia.use(
  express.static(path.join(__dirname, "..", "htdocs"), { index: false })
);

export const initServer = ({ port, host, render, ...options }) => {
  const app = express();
  let nab;

  if (render) {
    app.use(staticMedia);
    require("@babel/register")({
      ignore: [/(node_modules|server-build)/],
      presets: ["@babel/preset-env", "@babel/preset-react"]
    });
    const renderer = require("./renderer").default;
    app.get("*", expires(60), (...args) => renderer(nab, ...args));
  }

  const web = app.listen(port, host);

  nab = init({
    ...options,
    disableValidation: options.pistol ? true : options.disableValidation,
    web: options.pistol ? undefined : web,
    leech: options.pistol ? true : options.leech,
    peers: options.pistol
      ? port
        ? [] // [`http://${host}:${port}/gun`]
        : []
      : options.peers
  });
  if (options.pistol)
    nab.receiver = require("./receiver").default({
      redis: options.redis,
      peers: options.peers,
      web
    });
  // without a get gun never connects to receiver
  if (options.pistol) nab.gun.get("~@").once(() => null);
  return nab;
};
