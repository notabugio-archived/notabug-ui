/* globals Promise */
const { identity, keys, prop, path } = require("ramda");

module.exports = db => {
  const getPath = (keyList, opts = {}) => {
    const on = fn => {
      let value;
      let hasResponse = false;
      const received = val => (hasResponse = true) && bound((value = val));
      const bound = fn.bind(thisChain);
      const requested = {};
      const graph = {};

      const connection = db.connected(msg => {
        const { json } = msg;
        keys(prop("put", json)).forEach(soul => {
          if (!requested[soul]) return;
          const node = path(["put", soul], json);
          if (!node && !hasResponse) received();
          if (node) graph[soul] = node;
        });
        const nextValue = getValue(keyList);
        if (nextValue !== value) received(nextValue);
      });

      const getNode = soul => {
        if (requested[soul]) return graph[soul];
        requested[soul] = true;
        connection.receive({
          ...opts,
          json: { get: { "#": soul } },
          skipValidation: true
        });
        return graph[soul];
      };

      const getValue = kl => {
        const lastKey = kl[kl.length - 1];
        if (kl.length === 1) return getNode(lastKey);
        const parentValue = getValue(kl.slice(0, kl.length - 1));
        if (!parentValue) return;
        const value = prop(lastKey, parentValue);
        if (value && value["#"]) return getNode(value["#"]);
        if (kl === keyList) received(value);
        return value;
      };

      connection.receive({ json: { leech: true } });
      getValue(keyList);
      return () => db.disconnected(connection);
    };

    const then = (fn = identity) =>
      new Promise(resolve => {
        const unsubscribe = on(val => {
          resolve(val);
          unsubscribe();
        });
      }).then(fn);

    const once = fn => then(fn.bind(thisChain)) && thisChain;
    const get = (key, opts = {}) => getPath([...keyList, key], opts);
    const thisChain = { get, on, then, once };
    return thisChain;
  };

  db.get = (key, opts = {}) => getPath([key], opts);
  return db;
};
