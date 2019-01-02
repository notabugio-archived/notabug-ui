const { without } = require("ramda");
module.exports = db => {
  db.onIn(msg => {
    const { from, json, noRelay } = msg;
    if (noRelay) return msg;
    without([from], db.connections).forEach(c =>
      c.send({ from, json, skipValidation: true })
    );
    return msg;
  });
  return db;
};
