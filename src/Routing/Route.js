import React, { useMemo } from "react";
import * as R from "ramda";
import qs from "query-string";
import { useQuery } from "utils";
import { PageContext, useNotabug } from "NabContext";

const usePageProvider = ({
  location: { pathname, search },
  match: { params },
  withMatch = R.always(null)
}) => {
  const { me } = useNotabug();
  const authorId = R.prop("pub", me);
  const query = qs.parse(search);
  const count = parseInt(query.count, 10) || 0;
  const limit = parseInt(query.limit, 10) || 0;

  const meta = useMemo(() => {
    const query = qs.parse(search);

    return R.mergeLeft({ pathname, query }, withMatch({ authorId, params, query }));
  },
  [
    authorId,
    pathname,
    search
  ]);
  const { ids: idsQuery, space: specQuery } = meta;
  const [spec = {}] = useQuery(specQuery, []);
  const result = { meta, spec, idsQuery, specQuery, count, limit };

  return useMemo(() => result, R.values(result));
};

export const Route = ({ children, component: Component, ...props }) => {
  const page = usePageProvider(props);

  return (
    <PageContext.Provider value={page}>
      <Component {...props} />
    </PageContext.Provider>
  );
};

export const toRoute = ([path, props]) => ({
  ...props,
  path,
  component: R.compose(
    Route,
    R.mergeLeft(props)
  )
});
