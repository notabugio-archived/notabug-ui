import Promise from "promise";
import React from "react";
import { StaticRouter as Router, matchPath } from "react-router-dom";
import { renderToString } from "react-dom/server";
import { App, routes } from "App";
import init from "notabug-peer";
import serialize from "serialize-javascript";

const serializeState = (data={}) => `
<script type="text/javascript">
window.initNabState = ${serialize(data, { isJSON: true })};
</script>
`;

export default (nab, req, res) => require("fs").readFile(
  require("path").resolve(__dirname, "..", "htdocs", "index.html"), "utf8",
  (err, htmlData) => {
    let routeMatch;
    let dataQuery = Promise.resolve();
    if (err) return console.error("err", err) || res.status(500).end();
    const isJson = (/\.json$/.test(req.path));
    const urlpath = (isJson ? req.path.replace(/\.json$/, "") : req.path).replace(/^\/api/, "");
    const url = isJson ? req.url.replace(req.path, urlpath) : req.url;
    const route = routes.find(route => routeMatch = matchPath(urlpath, route));
    if (!route) return res.status(404).end();

    const notabugApi = init({ noGun: true, localStorage: false, disableValidation: true });
    const scope = notabugApi.scope = nab.newScope({ isCacheing: true });

    if (route.getListingParams)
      dataQuery = nab.scopedListing({ scope }).withData
        .query(route.getListingParams({ ...routeMatch, query: req.query }));

    return dataQuery.then(() => {
      const props = { context: {}, location: url };
      const html = renderToString(<Router {...props}><App {...{ notabugApi }} /></Router>);
      console.log("rendered", url, isJson ? "json" : "html");
      if (isJson) return res.send(notabugApi.scope.getCache());
      const parts = htmlData.split("!!!CONTENT!!!");
      const result = [parts[0], html, serializeState(scope.getCache()), parts[1]].join("");
      return res.send(result);
    }).catch(e => {
      console.error("error generating page", (e && e.stack) || e);
      res.send(htmlData.replace("!!!CONTENT!!!", "<noscript>Something Broke</noscript>"));
    });
  });
