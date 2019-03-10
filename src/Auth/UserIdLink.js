import React from "react";
import { Query } from "notabug-peer";
import { useQuery } from "utils";
import { AuthorLink } from "./AuthorLink";

export const UserIdLink = ({ userId }) => {
  const [userMeta] = useQuery(Query.userMeta, [userId]);

  if (!userId || !userMeta) return null;
  return <AuthorLink author={userMeta.alias} author_fullname={userId} />;
};
