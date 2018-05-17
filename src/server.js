import { blockedSouls } from "./lib/nab/blocked";
const express = require("express");
const path = require("path");
const app = express();
const Gun = require("gun");
require("gun/lib/server");
require("./lib/nab/index");

app.use(Gun.serve);
app.use(express.static(path.join(__dirname, "..", "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

const server = app.listen(process.env.PORT || 3000);

const peers = [
  // "https://notabug.io/gun"
];

Gun({ peers, localStorage: false, web: server });

blockedSouls.forEach(soul => console.log({ soul }) || gun.get(soul).put({
  url: null,
  body: "[removed]"
}));
