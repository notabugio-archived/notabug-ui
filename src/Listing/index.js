import {
  createContext,
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback
} from "react";
import { assoc, propOr, uniq, difference } from "ramda";
import qs from "query-string";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { NabContext, useScope } from "NabContext";
import { SOUL_DELIMETER } from "notabug-peer/util";
export { Thing } from "./Thing";

const { all } = Promise;

export const useListing = ({ listingParams }) => {
  const { api } = useContext(NabContext);
  const { soul } = listingParams;
  const scope = useScope();
  const [speculativeIds, setSpeculativeIds] = useState([]);
  const [state, setState] = useState(
    useMemo(() => api.queries.listing.now(scope, soul), [soul])
  );
  const update = useCallback(
    () => setState(api.queries.listing.now(scope, soul)),
    [soul]
  );
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
  const { ids: canonicalIds, tabs, curators, censors } = useMemo(
    () => ({
      ids: propOr("", "ids", state)
        .split("+")
        .filter(x => !!x),
      tabs: propOr("", "tabs", state)
        .split(SOUL_DELIMETER)
        .filter(x => !!x),
      curators: propOr("", "curators", state)
        .split(SOUL_DELIMETER)
        .filter(x => !!x),
      censors: propOr("", "censors", state)
        .split(SOUL_DELIMETER)
        .filter(x => !!x)
    }),
    [state]
  );

  const ids = useMemo(() => uniq([...speculativeIds, ...canonicalIds]), [
    ids,
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

  useEffect(
    () => {
      update();
      scope.on(update);
      return () => scope.off(update);
    },
    [update]
  );

  return {
    ...(state || {}),
    ids,
    tabs,
    curators,
    censors,
    includeRanks,
    isChat,
    createdAt,
    speculativeIds: speculativeIdsMap,
    listingParams,
    addSpeculativeId
  };
};

export const useLimitedListing = ({
  ids: allIds,
  limit: limitProp,
  listingParams,
  location: { search }
}) => {
  const query = qs.parse(search, { ignoreQueryPrefix: true });
  const limit = parseInt(limitProp, 10) || parseInt(query.limit, 10) || 25;
  const count = parseInt(listingParams.count, 10) || 0;
  const ids = allIds.slice(count, count + limit);
  return { ids, limit, count };
};

export const useListingContent = ({ ids }) => {
  const { api } = useContext(NabContext);
  const scope = useScope();
  const initialContent = useMemo(
    () =>
      ids.reduce((res, id) => ({
        ...res,
        [id]: api.queries.thingData.now(scope, id)
      })),
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
  const listingProps = { ...useListing({ listingParams }), ContentContext };
  const listingData = useMemo(() => listingProps, Object.values(listingProps));
  return { ListingContext, ContentContext, listingData };
};

export const useNestedListingContext = ListingContext => {
  const listingData = useContext(ListingContext);
  const { ContentContext, ids, listingParams } = listingData;
  const contentProps = useListingContent({ ids, listingParams });
  const contentData = useMemo(() => contentProps, Object.values(contentProps));
  return { ContentContext, listingData, contentData };
};
