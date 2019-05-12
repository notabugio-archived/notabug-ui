import {
  createContext,
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback,
  useRef
} from "react";
import * as R from "ramda";
import { Schema } from "@notabug/peer";
import { useNotabug } from "/NabContext";
import { useQuery, useScope } from "/utils";
export { Thing } from "./Thing";

const useListing = ({
  idsQuery,
  specQuery,
  limit: limitProp = 0,
  count = 0
}) => {
  const [speculativeIds, setSpeculativeIds] = useState([]);
  const [limit, setLimit] = useState(limitProp);

  const query = useMemo(() => {
    const res = {};

    if (count) res.count = count;
    if (limit) res.limit = limit;
    return res;
  }, [limit, count]);

  const [canonicalIds = []] = useQuery(idsQuery, [query], "useListingIds");
  const [spec = {}] = useQuery(specQuery, []);
  const opId = R.path(["filters", "allow", "ops", 0], spec);

  const ids = useMemo(
    () => R.uniq([...speculativeIds, ...(canonicalIds || [])]),
    [canonicalIds, speculativeIds]
  );

  const addSpeculativeId = useCallback(
    id =>
      setSpeculativeIds(specIds =>
        R.without(canonicalIds, R.uniq([id, ...specIds]))
      ),
    []
  );

  const speculativeIdsMap = useMemo(
    () => speculativeIds.reduce((res, id) => ({ ...res, [id]: true }), {}),
    [speculativeIds]
  );

  useEffect(() => {
    setSpeculativeIds(specIds => R.difference(specIds, canonicalIds));
  }, [canonicalIds.join(",")]);

  return {
    ...spec,
    ids,
    idsQuery,
    opId,
    limit,
    setLimit,
    speculativeIds: speculativeIdsMap,
    addSpeculativeId
  };
};

export const useListingContent = ({ ids, indexer }) => {
  const { api } = useNotabug();
  const scope = useScope();
  const initialContent = useMemo(
    () =>
      ids.reduce(
        (res, id) => ({
          ...res,
          [id]: api.queries.thingData.now(scope, id)
        }),
        {}
      ),
    []
  );
  const [content, setContent] = useState(initialContent);

  const replyTree = useMemo(
    () =>
      ids.reduce((r, id) => {
        const data = content[id];
        const { replyToId, opId } = data || {};
        const parentId = replyToId || opId;

        if (!parentId) return r;
        const replies = (r[parentId] = r[parentId] || {});

        replies[id] = data;
        return r;
      }, {}),
    [content]
  );

  const chains = useRef({});

  useEffect(() => {
    for (let thingId of ids) {
      if (thingId in chains.current) continue;
      chains.current[thingId] = api.gun
        .get(Schema.Thing.route.reverse({ thingId }))
        .get("data")
        .on(result => result && setContent(R.assoc(thingId, result)));
    }
  }, [ids]);

  useEffect(
    () => () =>
      Object.values(chains.current).forEach(chain => chain && chain.off()),
    []
  );

  return { replyTree, content };
};

export const useListingContext = ({ idsQuery, specQuery }) => {
  const ListingContext = useMemo(() => createContext(), []);
  const ContentContext = useMemo(() => createContext(), []);
  const listingProps = useListing({ idsQuery, specQuery });
  const listingData = { ...listingProps, ContentContext };

  return { ListingContext, ContentContext, listingData };
};

export const useNestedListingContext = ListingContext => {
  const listingData = useContext(ListingContext);
  const { ContentContext, ids, indexer } = listingData;
  const contentProps = useListingContent({ ids, indexer });
  const contentData = useMemo(() => contentProps, Object.values(contentProps));

  return { ContentContext, listingData, contentData };
};
