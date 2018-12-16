/* globals RindexedDB */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from "react";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { assoc } from "ramda";
import { withRouter } from "react-router-dom";
import isNode from "detect-node";
import fetch from "isomorphic-fetch";
import "gun/gun";
import notabugPeer from "notabug-peer";

let INDEXEDDB = false;
let LOCAL_STORAGE = false;
let FORCE_REALTIME = false;

if (!isNode) {
  INDEXEDDB = !!window.indexedDB && !!/indexeddb/.test(window.location.search);
  LOCAL_STORAGE = !INDEXEDDB && !!/localStorage/.test(window.location.search);
  FORCE_REALTIME = !/norealtime/.test(window.location.search);
  if (LOCAL_STORAGE) INDEXEDDB = false;
  if (INDEXEDDB) console.log("using indexeddb");
  if (LOCAL_STORAGE) console.log("using localstorage");
  require("gun/lib/les.js");
  if (INDEXEDDB) {
    require("gun/lib/radix.js");
    require("gun/lib/radisk.js");
    require("gun/lib/store.js");
    require("gun/lib/rindexed.js");
  }
  if (!/nosea/.test(window.location.search)) require("gun/sea");
}

export const NabContext = createContext();
export const useNotabug = () => useContext(NabContext);

export const useNabGlobals = ({ notabugApi, history }) => {
  let hasLocalStorage = false;
  const api = useMemo(
    () => {
      if (notabugApi) return notabugApi;
      hasLocalStorage = isLocalStorageNameSupported();
      const nab = notabugPeer({
        noGun: isNode ? true : false,
        localStorage: LOCAL_STORAGE && hasLocalStorage,
        persist: INDEXEDDB,
        disableValidation: true,
        storeFn: INDEXEDDB ? RindexedDB : null,
        leech: true,
        super: false,
        peers: isNode ? [] : [window.location.origin + "/gun"]
      });
      if (!isNode && !nab.scope) {
        nab.scope = nab.newScope({
          cache: window.initNabState,
          isRealtime: FORCE_REALTIME,
          onlyCache: !FORCE_REALTIME,
          isCached: true, //!FORCE_REALTIME,
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
    evt => {
      evt && evt.preventDefault();
      api.gun.user().leave();
      setUser(null);
      sessionStorage && sessionStorage.clear();
      if (hasLocalStorage) {
        localStorage.setItem("nabAlias", "");
        localStorage.setItem("nabPassword", "");
      }
    },
    [api]
  );

  const onFetchCache = useCallback((pathname, search) => {
    try {
      // if (FORCE_REALTIME) return Promise.resolve();
      return Promise.resolve();
      return fetch(`/api${pathname}.json${search}`, [])
        .then(response => {
          if (response.status !== 200)
            throw new Error("Bad response from server");
          return response.json();
        })
        .then(api.scope.loadCachedResults);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const onMarkMine = useCallback(id => setMyContent(assoc(id, true)), []);

  useEffect(
    () => {
      if (!isNode && api.gun) window.notabug = api;
      api.onLogin(didLogin);
      const alias = localStorage.getItem("nabAlias") || "";
      const password = localStorage.getItem("nabPassword") || "";
      if (alias && password)
        api.login(alias, password).catch(err => {
          console.error("autologin failed", err);
        });
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
      hasLocalStorage,
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
      hasLocalStorage,
      hasAttributedReddit,
      setHasAttributedReddit
    ]
  );
};

export const NabProvider = withRouter(({ history, notabugApi, children }) => (
  <NabContext.Provider value={useNabGlobals({ notabugApi, history })}>
    {children}
  </NabContext.Provider>
));

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
