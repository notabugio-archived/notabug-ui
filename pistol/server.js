const { pipe, identity } = require("ramda");
const commandLineArgs = require("command-line-args");
const Pistol = require("./core");
const deduplicateMessages = require("./dedup");
const allowLeech = require("./leech");
const relayMessages = require("./relay");
const preventConflicts = require("./conflicts");
const chain = require("./chain");
const websocket = require("./websocket");
const suppressor = require("./notabug-schema");
// const suppressor = require("./suppressor").createSuppressor();
const validateMessage = ({ json, skipValidation, ...msg }) => {
  if (skipValidation) return { ...msg, json };
  return suppressor.validate(json).then(isValid => {
    if (!isValid) return console.error(suppressor.validate.errors, json);
    return { ...msg, json };
  });
};

const WebsocketRelayPistol = opts =>
  pipe(
    Pistol,
    db => db.onIn(validateMessage) && db,
    deduplicateMessages,
    allowLeech,
    opts.redis
      ? pipe(
          require("./redis").respondToGets,
          chain,
          preventConflicts
        )
      : identity,
    relayMessages,
    db => db.onOut(validateMessage) && db,
    opts.port ? websocket.server(opts.port) : identity
  )(opts);

WebsocketRelayPistol(
  commandLineArgs([
    { name: "redis", alias: "r", type: Boolean, defaultValue: false },
    { name: "port", alias: "p", type: Number, defaultValue: 4242 }
  ])
);
