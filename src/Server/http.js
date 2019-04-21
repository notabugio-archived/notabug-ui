import path from "path";
import express from "express";
import compression from "compression";
import expires from "express-cache-headers";

import init from "@notabug/peer";

const Gun = (global.Gun = require("gun/gun"));
const staticMedia = express.Router();

staticMedia.use(
  express.static(path.join(__dirname, "..", "htdocs"), { index: false })
);

export const initServer = ({ port, host, render, ...options }) => {
  const app = express();
  let nab;

  app.use(compression());

  if (options.dev) {
    app.use(staticMedia);
    const Bundler = require("parcel-bundler");
    const bundler = new Bundler(
      path.join(__dirname, "..", "src", "index.html")
    );
    app.use(bundler.middleware());
  } else if (render) {
    app.use(staticMedia);
    const renderer = require("./renderer").default;

    app.get("*", expires(60), (...args) => renderer(nab, ...args));
  }

  const web = app.listen(port, host);

  nab = init(Gun, {
    ...options,
    disableValidation: options.pistol ? true : options.disableValidation,
    web: options.pistol ? undefined : web,
    leech: options.leech,
    peers: options.pistol
      ? port
        ? [`http://${host || "127.0.0.1"}:${port}/gun`]
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
