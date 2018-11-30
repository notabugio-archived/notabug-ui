import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback
} from "react";
import Helmet from "react-helmet";
import { NabContext, useScope } from "NabContext";
import { PageTemplate } from "Page";
import { Thing } from "Listing";
import { WikiPageCreate } from "./PageCreate";
import debounce from "lodash/debounce";

export const WikiPageContent = ({
  emptyContent = null,
  name = "index",
  identifier
}) => {
  const { api, me } = useContext(NabContext);
  const scope = useScope([name, identifier]);
  const [id, setId] = useState(
    useMemo(() => api.queries.wikiPageId.now(scope, identifier, name), [])
  );

  const doUpdate = useCallback(
    () => {
      const updatedId = api.queries.wikiPageId.now(scope, identifier, name);
      updatedId && setId(updatedId);
    },
    [scope]
  );

  useEffect(
    () => {
      const update = debounce(doUpdate, 50);
      scope.on(update);
      return () => scope.off(update);
    },
    [scope]
  );

  if (!id && me && identifier === me.pub) return <WikiPageCreate name={name} />;
  if (!id) return emptyContent;
  return <Thing id={id} isDetail name={name} />;
};

export const WikiPage = ({
  match: {
    params: { name = "index", identifier }
  }
}) => (
  <PageTemplate name={name}>
    <Helmet>
      <body className="wiki-page" />
    </Helmet>
    <div className="content" role="main">
      <WikiPageContent
        {...{ name, identifier }}
        emptyContent="nothing to see here"
      />
    </div>
  </PageTemplate>
);
