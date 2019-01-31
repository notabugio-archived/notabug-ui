/* globals Promise */
const pm2 = require("pm2");
const commandLineArgs = require("command-line-args");

const options = commandLineArgs([
  { name: "peer", alias: "c", multiple: true, type: String }
]);

const start = conf =>
  new Promise((ok, fail) =>
    pm2.start(conf, (err, apps) => (err ? fail(err) : ok(apps)))
  );

pm2.connect(
  true,
  err => {
    if (err) console.error(err) || process.exit(2);
    const promises = [];

    promises.push(
      start({
        name: "http",
        exec_mode: "cluster",
        instances: 6,
        script: "server.js",
        args: ["--port", "3333", "--redis", "--pistol", "--render"]
      })
    );
    promises.push(
      start({
        name: "oracles",
        script: "server.js",
        args: [
          "--tabulate",
          "--listings",
          "--spaces",
          "--redis",
          "--peer",
          "http://localhost:3333/gun"
        ]
      })
    );
    options.peer && options.peer.length &&
      promises.push(
        start({
          name: "relay",
          script: "server.js",
          args: [
            "--disableValidation",
            "--peer",
            "http://localhost:3333/gun",
            ...options.peer.map(peer => `--peer ${peer}`)
          ]
        })
      );

    return Promise.all(promises)
      .catch(console.error)
      .finally(() => pm2.disconnect());
  }
);
