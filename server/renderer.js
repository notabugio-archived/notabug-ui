import React from "react";
import { StaticRouter } from "react-router-dom";
import { renderToString } from "react-dom/server";
//import { initialize } from "freactal/lib/server";
// import our main App component
import { App } from "components/notabug";
//import { provideState } from "freactal";

const path = require("path");
const fs = require("fs");

export default (req, res) => {
  // point to the html file created by CRA"s build tool
  const filePath = path.resolve(__dirname, "..", "htdocs", "index.html");
  fs.readFile(filePath, "utf8", (err, htmlData) => {
    if (err) {
      console.error("err", err);
      return res.status(404).end();
    }

    const context={};
    try {
      const html = renderToString((
        <StaticRouter context={context} location={req.url}><App /></StaticRouter>
      ));
      // inject the rendered app into our html and send it
      console.log("server rendered", req.url);
      return res.send(
        htmlData.replace(
          "<body class=\"loggedin subscriber\">",
          `<body class="loggedin subscriber">${html}`,
        )
      );
    } catch (e) {
      console.error("error generating page", (e && e.stack) || e);
      res.send(htmlData);
    }
  });
};
