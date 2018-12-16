import React from "react";
import { useNotabug } from "NabContext";
import { useQuery } from "utils";
import { AuthorLink } from "./AuthorLink";

export const UserIdLink = ({ userId }) => {
  const { api } = useNotabug();
  const [userMeta] = useQuery(api.queries.userMeta, [`~${userId}`]);

  if (!userId || !userMeta) return null;
  return (
    <AuthorLink author={userMeta.userAlias} author_fullname={userId} />
  );
};
