var cloneDeep = require("ramda").clone;

module.exports = function override(config) {
  // Add worker-loader by hijacking configuration for regular .js files.

  const workerExtension = /\.worker\.js$/;

  function isBabelLoader(rule) {
    return rule.loader && rule.loader.indexOf("babel-loader") !== -1;
  }

  function findBabelLoader(rule) {
    if (isBabelLoader(rule)) {
      return rule;
    }

    if (Array.isArray(rule.use) && rule.use.find(isBabelLoader)) {
      return rule;
    }

    return Array.isArray(rule.oneOf) && rule.oneOf.find(isBabelLoader);
  }

  function searchRules(rules) {
    for (let i = 0; i < rules.length; i++) {
      const babelRule = findBabelLoader(rules[i]);
      if (babelRule) {
        return babelRule;
      }
    }

    return {};
  }

  const babelLoader = searchRules(config.module.rules);

  const workerLoader = cloneDeep(babelLoader);

  workerLoader.test = workerExtension;
  workerLoader.use = [
    "worker-loader",
    { // Old babel-loader configuration goes here.
      //test: require.resolve("ccxt"),
      //loader: require.resolve("babel-loader"),
      loader: workerLoader.loader,
      options: workerLoader.options
    },
  ];
  delete workerLoader.loader;
  delete workerLoader.options;

  babelLoader.exclude = (babelLoader.exclude || []).concat([workerExtension]);

  config.module.rules.push(workerLoader);

  // Optionally output the final config to check it.
  //console.dir(config, { depth: 10, colors: true });

  return config;
};
