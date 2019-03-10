import {
  createContext,
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback
} from "react";
import * as R from "ramda";
import { useNotabug } from "NabContext";
import { useQuery, useScope } from "utils";
import { Promise } from "notabug-peer";
export { Thing } from "./Thing";

const { all } = Promise;

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

export const useLimitedListing = ({ idsQuery, limit, count = 0 }) => {
  const query = useMemo(() => ({ limit, count }), [limit, count]);
  const [ids = []] = useQuery(idsQuery, [query], "useLimitedListingIds");

  return { ids, limit, count };
};

export const useListingContent = ({ ids }) => {
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

  useEffect(() => {
    all(
      ids.map(id =>
        api.queries
          .thingData(scope, id)
          .then(data => setContent(R.assoc(id, data)))
      )
    );
  }, [ids]);

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
  const { ContentContext, ids } = listingData;
  const contentProps = useListingContent({ ids });
  const contentData = useMemo(() => contentProps, Object.values(contentProps));

  return { ContentContext, listingData, contentData };
};
