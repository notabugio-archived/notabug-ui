/* globals RindexedDB */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from "react";
import { assoc } from "ramda";
import { withRouter } from "react-router-dom";
import { isLocalStorageNameSupported } from "utils";
import isNode from "detect-node";
// import fetch from "isomorphic-fetch";
import notabugPeer, { Promise } from "notabug-peer";
const Gun = require("gun/gun");

let INDEXEDDB = false;
let LOCAL_STORAGE = false;

global.Gun = global.Gun || Gun;
if (!isNode) {
  // INDEXEDDB = !!window.indexedDB && !/noindexeddb/.test(window.location.search);
  INDEXEDDB = !!window.indexedDB && !!/indexeddb/.test(window.location.search);
  LOCAL_STORAGE = !INDEXEDDB && !!/localStorage/.test(window.location.search);
  if (LOCAL_STORAGE) INDEXEDDB = false;
  if (INDEXEDDB) console.log("using indexeddb");
  if (LOCAL_STORAGE) console.log("using localstorage");
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
export const PageContext = createContext();
export const usePageContext = () => useContext(PageContext);

export const useNabGlobals = ({ notabugApi, history }) => {
  let hasLocalStorage = false;
  const api = useMemo(() => {
    if (notabugApi) return notabugApi;
    hasLocalStorage = isLocalStorageNameSupported();
    const nab = notabugPeer(Gun, {
      noGun: !!isNode,
      localStorage: LOCAL_STORAGE && hasLocalStorage,
      persist: INDEXEDDB,
      disableValidation: true,
      storeFn: INDEXEDDB ? RindexedDB : null,
      leech: true,
      super: false,
      // peers: isNode ? [] : ["https://notabug.io/gun"]
      peers:
        isNode || !!/nopeer/.test(window.location.search)
          ? []
          : [window.location.origin + "/gun"]
    });

    if (!isNode && !nab.scope) {
      nab.scope = nab.newScope({
        cache: window.initNabState,
        onlyCache: false,
        isCached: true,
        isCacheing: false
      });
    }
    return nab;
  }, [notabugApi]);
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

  const onFetchCache = useCallback((/* pathname, search*/) => {
    try {
      // if (FORCE_REALTIME) return Promise.resolve();
      return Promise.resolve();
      /*
      return fetch(`/api${pathname}.json${search}`, []) // eslint-disable-line no-unreachable
        .then(response => {
          if (response.status !== 200)
            throw new Error("Bad response from server");
          return response.json();
        })
        .then(api.scope.loadCachedResults);
      */
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const onMarkMine = useCallback(id => setMyContent(assoc(id, true)), []);

  useEffect(() => {
    if (!isNode && api.gun) window.notabug = api;
    api.onLogin(didLogin);
    const alias = localStorage.getItem("nabAlias") || "";
    const password = localStorage.getItem("nabPassword") || "";

    if (alias && password)
      api.login(alias, password).catch(err => {
        console.error("autologin failed", err);
      });
  }, [api]);

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
