import React from "react";
import * as R from "ramda";
import qs from "query-string";
import { useNotabug } from "NabContext";

const listingComponent = (Component, getParams) => props => {
  const { me } = useNotabug();
  const userId = me && me.pub;

  if (!getParams) return <Component {...props} />;
  const {
    match: { params },
    location: { search }
  } = props;
  const query = qs.parse(search);
  const listingParams = getParams({ params, query, userId });

  return <Component {...{ ...props, listingParams }} key={userId || "anon"} />;
};

const spaceComponent = (Component, getParams) => props => {
  if (!getParams) return <Component {...props} />;
  const {
    match: { params },
    location: { search }
  } = props;
  const query = qs.parse(search);
  const spaceParams = getParams({ params, query });

  return <Component {...{ ...props, spaceParams }} />;
};

export const toRoute = ({
  component,
  getSpaceParams,
  getListingParams,
  preload,
  ...other
}) => ({
  ...other,
  getSpaceParams,
  getListingParams,
  preload: preload || R.always(Promise.resolve()),
  component: getSpaceParams
    ? spaceComponent(component, getSpaceParams)
    : listingComponent(component, getListingParams)
});
