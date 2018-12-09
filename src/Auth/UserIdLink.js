import React, { useContext } from "react";
import { NabContext } from "NabContext";
import { useQuery } from "utils";
import { AuthorLink } from "./AuthorLink";

export const UserIdLink = ({ userId }) => {
  const { api } = useContext(NabContext);
  const userMeta = useQuery(api.queries.userMeta, [`~${userId}`]);

  if (!userId || !userMeta) return null;
  return (
    <AuthorLink author={userMeta.userAlias} author_fullname={userId} />
  );
};
