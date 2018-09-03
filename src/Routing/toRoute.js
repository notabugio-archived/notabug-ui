import React from "react";
import qs from "qs";

const listingComponent = (Component, getParams) => props => {
  if (!getParams) return <Component {...props} />;
  const {
    match: { params },
    location: { search },
  } = props;
  const query = qs.parse(search, { ignoreQueryPrefix: true });
  const listingParams = getParams({ params, query });
  return <Component {...{ ...props, listingParams }} />;
};

export const toRoute = ({ component, getListingParams, ...other }) => ({
  ...other,
  getListingParams,
  component: listingComponent(component, getListingParams)
});

