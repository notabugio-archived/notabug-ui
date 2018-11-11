import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { assoc } from "ramda";
import isNode from "detect-node";
import "gun/gun";
import notabugPeer from "notabug-peer";

let LOCAL_STORAGE = false;
let RECALL_LOGIN = false;
let FORCE_REALTIME = false;

if (!isNode) {
  LOCAL_STORAGE = !/noLocalStorage/.test(window.location.search);
  FORCE_REALTIME = !/norealtime/.test(window.location.search);
  RECALL_LOGIN = !/norecall/.test(window.location.search);
  if (!/nosea/.test(window.location.search)) require("utils/sea");
}

export const NabContext = createContext();

export const useNabGlobals = ({ notabugApi, history }) => {
  const api = useMemo(
    () => {
      const nab =
        notabugApi ||
        notabugPeer({
          noGun: isNode ? true : false,
          localStorage: LOCAL_STORAGE && isLocalStorageNameSupported(),
          disableValidation: true,
          leech: true,
          super: false,
          peers: isNode ? [] : [window.location.origin + "/gun"]
        });
      if (!isNode && !nab.scope) {
        nab.scope = nab.newScope({
          cache: window.initNabState,
          isRealtime: FORCE_REALTIME,
          onlyCache: !FORCE_REALTIME,
          isCached: !FORCE_REALTIME,
          isCacheing: !FORCE_REALTIME
        });
      }
      return nab;
    },
    [notabugApi]
  );
  const [me, setUser] = useState(null);
  const [myContent, setMyContent] = useState({});
  const [hasAttributedReddit, setHasAttributedReddit] = useState(false);
  const didLogin = useCallback(meData => setUser(meData), []);

  const onLogout = useCallback(
    () => {
      api.gun.me().leave();
      sessionStorage && sessionStorage.clear();
      setUser(null);
    },
    [api]
  );

  const onFetchCache = useCallback(
    (pathname, search) =>
      fetch(`/api${pathname}.json${search}`, [])
        .then(response => {
          if (response.status !== 200)
            throw new Error("Bad response from server");
          return response.json();
        })
        .then(api.scope.loadCachedResults),
    []
  );

  const onMarkMine = useCallback(id => setMyContent(assoc(id, true)), []);

  useEffect(
    () => {
      if (!isNode && api.gun) window.notabug = api;
      api.onLogin(didLogin);

      if (RECALL_LOGIN && api.gun.me) {
        api.gun.me().recall({ sessionStorage: true });
        const check = () => {
          const auth = api.isLoggedIn();
          if (api.isLoggedIn()) didLogin(auth);
          clearInterval(check);
        };
        setInterval(check, 100);
      }
    },
    [api]
  );

  return useMemo(
    () => ({
      api,
      me,
      history,
      myContent,
      onFetchCache,
      onMarkMine,
      onLogout,
      hasAttributedReddit,
      setHasAttributedReddit
    }),
    [
      api,
      me,
      history,
      myContent,
      onFetchCache,
      onMarkMine,
      onLogout,
      hasAttributedReddit,
      setHasAttributedReddit
    ]
  );
};

export const useScope = () => {
  const { api } = useContext(NabContext);
  const scope = isNode
    ? api.scope
    : useMemo(
        () =>
          api.newScope({
            cache: api.scope.getCache(),
            isRealtime: FORCE_REALTIME,
            onlyCache: !FORCE_REALTIME,
            isCached: !FORCE_REALTIME,
            isCacheing: !FORCE_REALTIME
          }),
        []
      );
  useEffect(
    () => {
      if (scope === api.scope) return;
      const updateCache = () => scope.loadCachedResults(api.scope.getCache());
      api.scope.on(updateCache);
      return () => api.scope.off(updateCache);
    },
    [scope]
  );
  return scope;
};

// https://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an
function isLocalStorageNameSupported() {
  var testKey = "test",
    storage = window.localStorage;
  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn("disabling local storage", error);
    return false;
  }
}
