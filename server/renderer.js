import Promise from "promise";
import React from "react";
import { compose, propOr, keysIn } from "ramda";
import { StaticRouter as Router, matchPath } from "react-router-dom";
import { renderToString } from "react-dom/server";
import { App } from "App";
import { routes } from "Routing";
import init from "./notabug-peer";
import { query, all } from "./notabug-peer/scope";
import serialize from "serialize-javascript";

const serializeState = (data = {}) => `
<script type="text/javascript">
window.initNabState = ${serialize(data, { isJSON: true })};
</script>
`;

const preload = (nab, scope, params) => {
  const getLimitedListingIds = query((scope, { soul, limit, count = 0 }) =>
    nab.queries
      .listing(scope, soul)
      .then(
        compose(
          idString => (idString || "").split("+").filter(x => !!x),
          propOr("", "ids")
        )
      )
      .then(allIds =>
        limit || count ? allIds.slice(count, count + limit) : allIds
      )
  );
  const preloadPageData = query((scope, params) =>
    getLimitedListingIds(scope, params).then(ids =>
      all(ids.map(id => nab.queries.thingData(scope, id)))
        .then(data => {
          const opIds = {};
          for (const item in data) {
            const opId = propOr(null, "opId", item);
            if (opId && !data[opId]) opIds[opId] = true;
          }
          const opIdsKeys = keysIn(opIds);
          return Promise.all(
            [...ids, ...opIdsKeys].map(id =>
              nab.queries.thingScores(scope, params.indexer, id)
            )
          ).then(() =>
            opIdsKeys.length
              ? all(opIdsKeys.map(id => nab.queries.thingData(scope, id)))
              : data
          );
        })
        .then(data =>
          params.authorIds
            ? Promise.all(
                params.authorIds.map(id =>
                  nab.queries.userMeta(scope, `~${id}`)
                )
              )
            : data
        )
    )
  );
  return preloadPageData.query(scope, params);
};

export default (nab, req, res) =>
  require("fs").readFile(
    require("path").resolve(__dirname, "..", "htdocs", "index.html"),
    "utf8",
    (err, htmlData) => {
      let routeMatch;
      let dataQuery = Promise.resolve();
      if (err) return console.error("err", err) || res.status(500).end();
      const isJson = /\.json$/.test(req.path);
      const urlpath = (isJson
        ? req.path.replace(/\.json$/, "")
        : req.path
      ).replace(/^\/api/, "");
      const url = isJson ? req.url.replace(req.path, urlpath) : req.url;
      const route = routes.find(
        route => (routeMatch = matchPath(urlpath, route))
      );
      if (!route) return res.status(404).end();
      const notabugApi = init({
        noGun: true,
        localStorage: false,
        disableValidation: true
      });
      const scope = (notabugApi.scope = nab.newScope({ isCacheing: true, noGun: true }));

      if (route.getListingParams) {
        dataQuery = preload(
          nab,
          scope,
          route.getListingParams({ ...routeMatch, query: req.query })
        );
      }

      return dataQuery
        .then(() => {
          const props = { context: {}, location: url };
          const html = renderToString(
            <Router {...props}>
              <App {...{ notabugApi }} />
            </Router>
          );
          // console.log("rendering", req.url);
          if (isJson) return res.send(notabugApi.scope.getCache());
          const parts = htmlData.split("!!!CONTENT!!!");
          const result = [
            parts[0],
            html,
            serializeState(scope.getCache()),
            parts[1]
          ].join("");
          return res.send(result);
        })
        .catch(e => {
          console.error("error generating page", (e && e.stack) || e);
          res.send(
            htmlData.replace(
              "!!!CONTENT!!!",
              "<noscript>Something Broke</noscript>"
            )
          );
        });
    }
  );
