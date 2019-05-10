/* globals RindexedDB */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from "react";
import { assoc } from "ramda";
import { isLocalStorageNameSupported } from "/utils";
import isNode from "detect-node";
// import fetch from "isomorphic-fetch";
import notabugPeer from "@notabug/peer";
const Gun = require("gun/gun");

require("gun/lib/not");

let INDEXEDDB = false;
let LOCAL_STORAGE = false;
let DISABLE_CACHE = false;

global.Gun = global.Gun || Gun;
if (!isNode) {
  // INDEXEDDB = !!window.indexedDB && !/noindexeddb/.test(window.location.search);
  INDEXEDDB = !!window.indexedDB && !!/indexeddb/.test(window.location.search);
  LOCAL_STORAGE = !INDEXEDDB && !!/localStorage/.test(window.location.search);
  DISABLE_CACHE = !!/disablecache/.test(window.location.search);
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

  require("@notabug/gun-http").attachToGun(Gun, {
    peers: [window.location.origin.replace(/^http/, "ws") + "/gun"]
  });
}

export const NabContext = createContext({});
export const useNotabug = () => useContext(NabContext);
export const PageContext = createContext({});
export const usePageContext = () => useContext(PageContext);

export const useNabGlobals = ({ notabugApi, history }) => {
  let hasLocalStorage = useMemo(isLocalStorageNameSupported, []);
  const api = useMemo(() => {
    if (notabugApi) return notabugApi;
    const nab = notabugPeer(Gun, {
      noGun: !!isNode,
      localStorage: LOCAL_STORAGE && hasLocalStorage,
      persist: INDEXEDDB,
      disableValidation: true,
      storeFn: INDEXEDDB ? RindexedDB : null,
      leech: true,
      super: false
    });

    if (!isNode && !nab.scope) {
      if (DISABLE_CACHE) console.log("CACHE DISABLED");
      nab.scope = nab.newScope({
        cache: DISABLE_CACHE ? {} : window.initNabState,
        onlyCache: false,
        isCached: !DISABLE_CACHE,
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

  const [alias, password] = useMemo(
    () => [
      (hasLocalStorage && localStorage.getItem("nabAlias")) || "",
      (hasLocalStorage && localStorage.getItem("nabPassword")) || ""
    ],
    []
  );

  const [isLoggingIn, setIsLoggingIn] = useState(!!(alias && password));

  useEffect(() => {
    if (!isNode && api.gun) window.notabug = api;
    api.onLogin(didLogin);

    if (alias && password) {
      api
        .login(alias, password)
        .catch(err => {
          console.error("autologin failed", err);
        })
        .finally(() => {
          setIsLoggingIn(false);
        });
      setTimeout(() => {
        if (!api.isLoggedIn()) {
          setIsLoggingIn(false);
          localStorage.setItem("nabAlias", "");
          localStorage.setItem("nabPassword", "");
        }
      }, 5000);
    }
  }, [api]);

  return useMemo(
    () => ({
      isNode,
      api,
      me,
      isLoggingIn,
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
      isNode,
      api,
      me,
      isLoggingIn,
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
