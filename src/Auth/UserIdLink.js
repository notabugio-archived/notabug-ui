import React, { useState, useContext, useEffect } from "react";
import { NabContext } from "NabContext";
import { AuthorLink } from "./AuthorLink";

export const UserIdLink = ({ userId, alias: aliasProp }) => {
  const { api } = useContext(NabContext);
  const [alias, setAlias] = useState(aliasProp);

  useEffect(() => {
    api.gun && api.gun.get(`~${userId}`).then(user => {
      if (!user) return;
      setAlias(user.alias);
    });
  }, [api, userId]);

  if (!userId || !alias) return null;
  return (
    <AuthorLink author={alias} author_fullname={userId} />
  );
};
