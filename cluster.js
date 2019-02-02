/* globals Promise */
const pm2 = require("pm2");
const commandLineArgs = require("command-line-args");

const options = commandLineArgs([
  { name: "port", alias: "p", type: Number, defaultValue: 3333 },
  { name: "peer", alias: "c", multiple: true, type: String }
]);

const start = conf =>
  new Promise((ok, fail) =>
    pm2.start(conf, (err, apps) => (err ? fail(err) : ok(apps)))
  );

pm2.connect(err => {
  if (err) console.error(err) || process.exit(2);
  const promises = [];

  promises.push(
    start({
      name: "http",
      exec_mode: "cluster",
      instances: "max",
      script: "server.js",
      env: { NODE_ENV: "production" },
      args: ["--port", options.port, "--redis", "--pistol", "--render"]
    })
  );
  /*
  promises.push(
    start({
      name: "http",
      exec_mode: "fork",
      node_args: "-prof",
      script: "server.js",
      env: { NODE_ENV: "production" },
      args: ["--port", 8888, "--redis", "--pistol", "--render"]
    })
  );
  */
  promises.push(
    start({
      name: "oracles",
      script: "server.js",
      env: { NODE_ENV: "production" },
      node_args: "-prof",
      args: [
        "--disableValidation",
        "--tabulate",
        "--listings",
        "--spaces",
        "--redis",
        "--peer",
        "http://localhost:3333/gun"
      ]
    })
  );
  options.peer &&
    options.peer.length &&
    promises.push(
      start({
        name: "relay",
        script: "server.js",
        env: { NODE_ENV: "production" },
        args: [
          "--disableValidation",
          "--peer",
          "http://localhost:3333/gun",
          ...options.peer.reduce(
            (peers, peer) => [...peers, "--peer", peer],
            []
          )
        ]
      })
    );

  return Promise.all(promises)
    .catch(console.error)
    .finally(() => pm2.disconnect());
});
