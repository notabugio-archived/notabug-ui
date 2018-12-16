import { useContext, useState, useCallback, useMemo, useEffect } from "react";
import { values } from "ramda";
import { NabContext } from "NabContext";
import isNode from "detect-node";
import debounce from "lodash/debounce";

export const useMemoizedObject = obj => useMemo(() => obj, values(obj));

export const useScope = (deps=[]) => {
  const { api } = useContext(NabContext);
  const scope = isNode
    ? api.scope
    : useMemo(
        () =>
          api.newScope({
            cache: api.scope.getCache(),
            isRealtime: true,
            onlyCache: false,
            isCached: true,
            isCacheing: false
          }),
        deps
      );
  useEffect(
    () => {
      if (scope === api.scope) return;
      const updateCache = (soul) => {
        if (!soul) scope.loadCachedResults(api.scope.getCache());
      };
      api.scope.on(updateCache);
      return () => api.scope.off(updateCache);
    },
    [scope]
  );
  return scope;
};

export const useQuery = (query, args=[]) => {
  const scope = useScope(args);

  const [hasResponseState, setHasResponse] = useState(false);
  const [result, setResult] = useState(
    useMemo(() => query.now(scope, ...args), [])
  );
  const hasResponse = (typeof result !== "undefined") || hasResponseState;

  const doUpdate = useCallback(
    () => query(scope, ...args).then(res => {
      setHasResponse(true);
      res && setResult(res);
    }),
    [scope, ...args]
  );

  useEffect(
    () => {
      setHasResponse(false);
      const update = debounce(doUpdate, 50);
      update();
      scope.on(update);
      return () => scope.off(update);
    },
    [doUpdate]
  );

  return [result, hasResponse];
};

export const useShowMore = (items, foldSize=5) => {
  const [visibleCount, setVisibleCount] = useState(foldSize);
  const moreCount = (items && items.length || 0) - visibleCount;

  const onShowMore = useCallback(
    evt => {
      evt && evt.preventDefault();
      setVisibleCount(items.length);
    },
    [items.length]
  );

  return { visibleCount, moreCount, onShowMore };
};
