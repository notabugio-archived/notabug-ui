import { useState, useCallback, useMemo, useEffect } from "react";
import { values } from "ramda";
import { useNotabug } from "NabContext";
import isNode from "detect-node";
import debounce from "lodash/debounce";

export const useMemoizedObject = obj => useMemo(() => obj, values(obj));

export const useToggle = (defaultState = false) => {
  const [isExpanded, setIsExpanded] = useState(defaultState);
  const onToggleExpanded = useCallback(evt => {
    evt && evt.preventDefault();
    setIsExpanded(ex => !ex);
  }, []);
  return [isExpanded, onToggleExpanded, setIsExpanded];
};

export const useScope = (deps=[]) => {
  const { api } = useNotabug();
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
      res && setResult(res);
      setHasResponse(true);
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
