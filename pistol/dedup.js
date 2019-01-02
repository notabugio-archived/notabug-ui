const { path } = require("ramda");
const MAX_MSG_ID_CACHE = 10000;

module.exports = db => {
  const receivedIds = {};
  function collectGarbage() {
    let ids;
    while ((ids = Object.keys(receivedIds)).length > MAX_MSG_ID_CACHE)
      delete receivedIds[ids[0]];
  }

  db.onIn(msg => {
    const id = path(["json", "#"], msg);
    if (!id || id in receivedIds) return null;
    receivedIds[id] = true;
    collectGarbage();
    return msg;
  });

  return db;
};
