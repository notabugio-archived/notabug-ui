const { curry } = require("ramda");
const { Server } = require("ws");
const PING = 60000;

module.exports.server = curry(({ web, port }, db) => {
  new Server({ port: !web ? port : undefined, server: web }).on("connection", ws => {
    let connected = true;
    let hasLoggedErr = false;
    const connection = db.connected(msg => {
      if (!msg || !msg.json || !connected) return;
      ws.send(JSON.stringify(msg.json), err => {
        if (!err || hasLoggedErr) return;
        console.warn("ws send err", err);
        hasLoggedErr = true;
      });
    });

    const pingInterval = setInterval(
      () => connection.send({ json: { ping: true }, skipValidation: true }),
      PING
    );

    const receive = raw => {
      try {
        const json = JSON.parse(raw);
        Array.isArray(json) ? json.forEach(receive) : connection.receive({ json });
      } catch (e) {
        console.error("PISTOL invalid ws msg", e);
      }
    };

    ws.on("message", receive);
    ws.on("close", () => {
      connected = false;
      clearInterval(pingInterval);
      db.disconnected(connection);
    });
  });
  return db;
});
