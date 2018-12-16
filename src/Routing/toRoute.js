import React, { useContext } from "react";
import qs from "qs";
import { NabContext } from "NabContext";

const listingComponent = (Component, getParams) => props => {
  const { me } = useContext(NabContext);
  const userId = me && me.pub;

  if (!getParams) return <Component {...props} />;
  const {
    match: { params },
    location: { search }
  } = props;
  const query = qs.parse(search, { ignoreQueryPrefix: true });
  const listingParams = getParams({ params, query, userId });
  return <Component {...{ ...props, listingParams }} key={userId || "anon"} />;
};

const spaceComponent = (Component, getParams) => props => {
  if (!getParams) return <Component {...props} />;
  const {
    match: { params },
    location: { search }
  } = props;
  const query = qs.parse(search, { ignoreQueryPrefix: true });
  const listingParams = getParams({ params, query });
  return <Component {...{ ...props, listingParams }} />;
};

export const toRoute = ({ component, getSpaceParams, getListingParams, ...other }) => ({
  ...other,
  getSpaceParams,
  getListingParams,
  component: getSpaceParams ? spaceComponent(component, getSpaceParams) : listingComponent(component, getListingParams)
});
