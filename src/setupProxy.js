const proxy = require("http-proxy-middleware");

module.exports = app => {
  app.use(proxy("/gun", { target: "http://localhost:3333", ws: true}));
  app.use(proxy("/api", { target: "http://localhost:3333" }));
};
