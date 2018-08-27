import path from "path";
import express from "express";
import expressStaticGzip from "express-static-gzip";
import expires from "express-cache-headers";
import init from "notabug-peer";

export const initServer = ({ port, host, render, ...options }) => {
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

  // Static Media
  router.use(
    "/media", expires({ ttl: 60*60*24 }),
    expressStaticGzip(path.join(__dirname, "..", "htdocs", "media"), { index: false })
  );
  router.use(
    "/static", expires({ ttl: 60*60*24 }),
    expressStaticGzip(path.join(__dirname, "..", "htdocs", "static"), { index: false })
  );
  router.use(express.static(path.join(__dirname, "..", "htdocs"), { index: false }));

  // Page Rendering
  renderer && app.get("^/$", expires(60), renderer);
  app.use(router); // Static Media
  renderer && app.get("*", expires(60), renderer);

  return nab = init({ ...options, web: app.listen(port, host) });
};
