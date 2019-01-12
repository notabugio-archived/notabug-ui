/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import Helmet from "react-helmet";
import { useNotabug } from "NabContext";
import { PageTemplate } from "Page";
import { Thing } from "Listing";
import { useQuery } from "utils";
import { WikiPageCreate } from "./PageCreate";

export const WikiPageContent = ({
  emptyContent = null,
  name = "index",
  asSource,
  identifier
}) => {
  const { api, me } = useNotabug();
  const [id] = useQuery(api.queries.wikiPageId, [identifier, name]);
  if (!id && me && identifier === me.pub) return <WikiPageCreate name={name} />;
  if (!id) return emptyContent;
  return <Thing key={id} id={id} isDetail {...{ asSource, name }} />;
};

export const WikiPage = ({
  match: {
    params: { name = "index", identifier }
  }
}) => (
  <PageTemplate name={name}>
    <Helmet>
      <body className="wiki-page loggedin subscriber" />
    </Helmet>
    <a name="content" key="anchor" />
    <div className="content" role="main">
      <WikiPageContent
        {...{ name, identifier }}
        emptyContent="nothing to see here"
      />
    </div>
  </PageTemplate>
);
