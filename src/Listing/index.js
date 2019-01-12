import {
  createContext,
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback
} from "react";
import { assoc, propOr, uniq, difference } from "ramda";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { useNotabug } from "NabContext";
import { useQuery, useScope } from "utils";
import { toListingObject } from "notabug-peer/source";
export { Thing } from "./Thing";

const { all } = Promise;

const useListing = ({ listingParams }) => {
  const { api } = useNotabug();
  const { soul } = listingParams;
  const [speculativeIds, setSpeculativeIds] = useState([]);
  const [state] = useQuery(api.queries.listing, [soul]);
  const createdAt = parseInt(propOr("", "createdAt", state));
  const includeRanksString = propOr("", "includeRanks", state);
  const isChatString = propOr("", "isChat", state);
  const includeRanks =
    includeRanksString &&
    includeRanksString !== "false" &&
    includeRanksString !== "0";
  const isChat = !!(
    isChatString &&
    isChatString !== "false" &&
    isChatString !== "0"
  );

  const canonicalIds = useMemo(
    () =>
      propOr("", "ids", state)
        .split("+")
        .filter(x => !!x),
    [propOr("", "ids", state)]
  );

  const source = propOr("", "source", state);
  const parsedSource = useMemo(() => toListingObject(source), [source, state]);

  const opId = parsedSource.filters.allow.ops[0];
  const ids = useMemo(() => uniq([...speculativeIds, ...canonicalIds]), [
    canonicalIds,
    speculativeIds
  ]);

  const addSpeculativeId = useCallback(
    id => setSpeculativeIds(specIds => uniq([id, ...specIds])),
    []
  );

  const speculativeIdsMap = useMemo(
    () =>
      speculativeIds.reduce((res, id) => ({ ...res, [id]: true }), {
        foo: "bar"
      }),
    [speculativeIds]
  );

  useEffect(
    () => {
      setSpeculativeIds(specIds => difference(specIds, canonicalIds));
    },
    [canonicalIds]
  );

  return {
    ...(state || {}),
    ...parsedSource,
    ids,
    opId,
    includeRanks,
    isChat,
    createdAt,
    speculativeIds: speculativeIdsMap,
    listingParams,
    addSpeculativeId
  };
};

export const useLimitedListing = ({ ids: allIds, limit, count = 0 }) => {
  const { api } = useNotabug();
  const ids = useMemo(() => allIds.slice(count, count + limit), [
    allIds,
    limit,
    count
  ]);
  const scope = api.scope;

  const fetchNextPage = useCallback(
    extraItems => {
      const start = count + limit;
      const end = start + extraItems;
      const nextIds = allIds.slice(start, end);
      if (!nextIds.length) return Promise.resolve();
      return Promise.all(
        nextIds.map(id =>
          api.queries.thingData(scope, id).then(res => {
            const { opId } = res || {};
            return opId && api.queries.thingData(scope, opId);
          })
        )
      ).then(() => new Promise(resolve => setTimeout(resolve, 50)));
    },
    [allIds, count, limit]
  );

  return { ids, limit, count, fetchNextPage };
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

  useEffect(
    () => {
      all(
        ids.map(id =>
          api.queries
            .thingData(scope, id)
            .then(data => setContent(assoc(id, data)))
        )
      );
    },
    [ids]
  );

  return { replyTree, content };
};

export const useListingContext = ({ listingParams }) => {
  const ListingContext = useMemo(() => createContext(), []);
  const ContentContext = useMemo(() => createContext(), []);
  const listingProps = useListing({ listingParams });
  const listingData = useMemo(() => ({ ...listingProps, ContentContext }), [
    JSON.stringify(listingProps)
  ]);
  return { ListingContext, ContentContext, listingData };
};

export const useNestedListingContext = ListingContext => {
  const listingData = useContext(ListingContext);
  const { ContentContext, ids, listingParams } = listingData;
  const contentProps = useListingContent({ ids, listingParams });
  const contentData = useMemo(() => contentProps, Object.values(contentProps));
  return { ContentContext, listingData, contentData };
};
