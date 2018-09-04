import React from "react";
import qs from "qs";
import { injectState } from "freactal";

const listingComponent = (Component, getParams) => injectState(props => {
  if (!getParams) return <Component {...props} />;
  const {
    state: { notabugUserId: userId },
    match: { params },
    location: { search },
  } = props;
  const query = qs.parse(search, { ignoreQueryPrefix: true });
  console.log({ params, query, userId });
  const listingParams = getParams({ params, query, userId });
  return <Component {...{ ...props, listingParams }} key={userId || "anon"}/>;
});

export const toRoute = ({ component, getListingParams, ...other }) => ({
  ...other,
  getListingParams,
  component: listingComponent(component, getListingParams)
});

