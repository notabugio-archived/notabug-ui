import path from "path";
import express from "express";
import expressStaticGzip from "express-static-gzip";
import expires from "express-cache-headers";
import init from "notabug-peer";
import { listingMeta, things } from "./listings";

export const initServer = ({ port, host, redis, render, ...options }) => {
  let nab;
  const app = express();
  const router = express.Router();
  const renderer = (...args) => render ? require("./renderer").default(nab, ...args) : null;

  if (render) {
    console.warn("---WARINING loading babel-register for server side rendering");
    require("babel-register")({
      ignore: [ /(node_modules|server-build)/ ],
      presets: ["es2015", "react-app"]
    });
  }

  const cache = (redis && false) ? require("express-redis-cache")({
    client: require("redis").createClient({ db: 1 }),
    expire: 30
  }) : { route() { return (req, res, next) => next(); } };

  // Static Media
  router.use(
    "/media",
    expires({ ttl: 60*60*24 }),
    expressStaticGzip(path.join(__dirname, "..", "htdocs", "media"), { index: false })
  );
  router.use(
    "/static",
    expires({ ttl: 60*60*24 }),
    expressStaticGzip(path.join(__dirname, "..", "htdocs", "static"), { index: false })
  );
  router.use(express.static(path.join(__dirname, "..", "htdocs"), { index: false }));

  // REST API
  app.get(
    "/api/topics/:topic.json",
    expires(60), cache.route({ expires: 60 }),
    (req, res) => listingMeta(nab, req, res)
  );

  app.get(
    "/api/submissions/:opId.json",
    expires(60), cache.route({ expires: 60 }),
    (req, res) => listingMeta(nab, req, res)
  );

  app.get(
    "/api/things/:id.json",
    expires(2*60*60), cache.route({ expires: 2*60*60 }),
    (req, res) => things(nab, req, res)
  );

  // Page Rendering
  renderer && app.get("^/$", expires(60), cache.route({ expires: 60 }), renderer);
  app.use(router); // Static Media
  renderer && app.get("*", expires(60), cache.route({ expires: 60 }), renderer);

  return nab = init({ ...options, web: app.listen(port, host) });
};
