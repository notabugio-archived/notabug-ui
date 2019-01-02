const { path, keys } = require("ramda");

module.exports = db => {
  db.onIn(msg => {
    if (path(["json", "leech"], msg)) {
      msg.from.set(["isLeeching"], true);
      return;
    }
    const askingFor = path(["json", "get", "#"], msg);
    [askingFor, ...keys(path(["json", "put"], msg))].forEach(
      soul => soul && msg.from.set(["hasAskedFor", soul], true)
    );
    return msg;
  });

  db.onOut(msg => {
    const { to, json, ignoreLeeching } = msg;
    if (!to.get(["isLeeching"]) || ignoreLeeching) return msg;
    const askedPuts = keys(json.put).filter(soul => {
      if (!to.get(["hasAskedFor", soul])) return false;
      const soulDeltas = path([soul, "_", ">"], json.put);
      if (!keys(soulDeltas).length) return true;
      let hasUpdates = false;
      keys(soulDeltas).forEach(key => {
        const known = to.get(["knownDeltas", soul, key]) || 0;
        const delta = parseFloat(soulDeltas[key]) || 0;
        if (known && delta <= known) return;
        to.set(["knownDeltas", soul, key], delta);
        hasUpdates = true;
      });
      return hasUpdates;
    });
    if (askedPuts.length) return msg;
  });

  return db;
};
