process.env.NODE_ENV = process.env.NODE_ENV || "production";
require("ignore-styles");

require("babel-register")({
  ignore: [ /(node_modules|server-build)/ ],
  presets: ["es2015", "react-app"]
});

require("./server-build/index");
