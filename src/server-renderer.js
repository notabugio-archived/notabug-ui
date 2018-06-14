import React from "react";
import StaticRouter from "react-router/StaticRouter";
import { renderToString } from "react-dom/server";
import { initialize } from "freactal/lib/server";
// import our main App component
import { App } from "components/notabug";
import { provideState } from "freactal";

const staticState = provideState({});

const path = require("path");
const fs = require("fs");

export default (req, res) => {
  // point to the html file created by CRA"s build tool
  const filePath = path.resolve(__dirname, "..", "build", "index.html");
  fs.readFile(filePath, "utf8", (err, htmlData) => {
    if (err) {
      console.error("err", err);
      return res.status(404).end();
    }
    const context={};
    // render the app as a string

    const StaticApp = staticState(() => (
      <StaticRouter context={context} location={req.url}><App /></StaticRouter>
    ));

    /*
    initialize(<StaticApp />)
      .then(({ vdom, state }) => {
        const appHTML = renderToString(vdom);
        console.log("appHTML", appHTML, state);
        return res.send(
          htmlData.replace(
            "<body class=\"loggedin subscriber\">",
            `<body class="loggedin subscriber">${appHTML}`,
          )
        );
      });
    */

    const html = renderToString(<StaticApp />);
    // inject the rendered app into our html and send it
    console.log(html);
    return res.send(
      htmlData.replace(
        "<body class=\"loggedin subscriber\">",
        `<body class="loggedin subscriber">${html}`,
      )
    );
  });
};
