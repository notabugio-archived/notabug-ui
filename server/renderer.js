import Promise from "promise";
import React from "react";
import { StaticRouter, matchPath } from "react-router-dom";
import { renderToString } from "react-dom/server";
//import { initialize } from "freactal/lib/server";
// import our main App component
import { App } from "components/notabug";
import { routes } from "components/notabug/routes";
//import { provideState } from "freactal";
import { calculateListing } from "./listings";
import init from "notabug-peer";
import serialize from "serialize-javascript";

const path = require("path");
const fs = require("fs");

export default (nab, req, res) => {
  // point to the html file created by CRA"s build tool
  const filePath = path.resolve(__dirname, "..", "htdocs", "index.html");
  fs.readFile(filePath, "utf8", (err, htmlData) => {
    if (err) {
      console.error("err", err);
      return res.status(404).end();
    }

    let routeMatch;
    const route = routes.find(route => {
      const match = matchPath(req.path, route);
      if (match) routeMatch = match;
      return match;
    });

    route.getStaticPeer = () => {
      const staticPeer = init({ noGun: true, localStorage: false, disableValidation: true });
      return calculateListing(nab, req, routeMatch)
        .then(staticPeer.loadState).then(() => staticPeer);
    };

    return Promise.resolve(route && route.getStaticPeer && route.getStaticPeer(routeMatch))
      .then(staticPeer => {
        try {
          const context={};
          const html = renderToString((
            <StaticRouter context={context} location={req.url}>
              <App notabugApi={staticPeer} />
            </StaticRouter>
          ));
          // inject the rendered app into our html and send it
          console.log("server rendered", req.url);
          const stateScript = `
<script type="text/javascript">
window.initNabState = ${serialize(staticPeer.getState(), { isJSON: true })};
</script>
          `;
          const parts = htmlData.split("!!!CONTENT!!!");
          const result = [parts[0], html, stateScript, parts[1]].join("");
          return res.send(result);
        } catch (e) {
          console.error("error generating page", (e && e.stack) || e);
          res.send(htmlData.replace("!!!CONTENT!!!", "<noscript>Something Broke</noscript>"));
        }
      });
  });
};
