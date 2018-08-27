import Promise from "promise";
import React from "react";
import { StaticRouter as Router, matchPath } from "react-router-dom";
import { renderToString } from "react-dom/server";
import { App } from "components/notabug";
import { routes } from "components/notabug/routes";
import init from "notabug-peer";
import serialize from "serialize-javascript";

const path = require("path");
const { readFile } = require("fs");

const calculateListing = (nab, req, routeMatch, scope) => {
  let params;
  const opId = req.params.opId || (routeMatch && routeMatch.params.submission_id);

  if (opId) {
    params = { submissionId: opId, sort: "new" };
  } else {
    const count = parseInt(req.query.count || 0, 10);
    const topic = req.params.topic || (routeMatch && routeMatch.params.topic) || "all";
    const topics = [topic];
    const sort = req.params.sort || (routeMatch && routeMatch.params.sort);
    const days = parseInt(req.query.days, 10);
    const limit = parseInt(req.query.limit, 10) || 25;
    params = { topics, sort, days, count, limit };
  }

  return nab.scopedListing({ scope: scope || nab.newScope() }).withData.query(params);
};

export default (nab, req, res) => readFile(
  path.resolve(__dirname, "..", "htdocs", "index.html"), "utf8",
  (err, htmlData) => {
    if (err) return console.error("err", err) || res.status(404).end();
    let routeMatch;
    const isJson = (/\.json$/.test(req.path));
    const urlpath = (isJson ? req.path.replace(/\.json$/, "") : req.path).replace(/^\/api/, "");
    const url = isJson ? req.url.replace(req.path, urlpath) : req.url;
    const route = routes.find(route => routeMatch = matchPath(urlpath, route));
    if (!route) return res.status(404).end();
    const staticPeer = init({ noGun: true, localStorage: false, disableValidation: true });
    const scope = staticPeer.scope = nab.newScope({ isCacheing: true });
    route.query = () => calculateListing(nab, req, routeMatch, scope).then(() => staticPeer);
    return Promise.resolve(route.query && route.query(routeMatch)).then(() => {
      const html = renderToString((
        <Router context={{}} location={url}><App notabugApi={staticPeer} /></Router>
      ));
      console.log("server rendered", isJson ? "json" : "html", url);
      if (isJson) return res.send(staticPeer.scope.getCache());
      const stateScript = `
<script type="text/javascript">
window.initNabState = ${serialize(staticPeer.scope.getCache(), { isJSON: true })};
</script>
      `;
      const parts = htmlData.split("!!!CONTENT!!!");
      const result = [parts[0], html, stateScript, parts[1]].join("");
      return res.send(result);
    }).catch(e => {
      console.error("error generating page", (e && e.stack) || e);
      res.status(500).end();
      // res.send(htmlData.replace("!!!CONTENT!!!", "<noscript>Something Broke</noscript>"));
    });
  });
