import React from "react";
import { withRouter } from "react-router-dom";

export const locationKey = Comp => withRouter(
  ({ location, ...props }) =>
    <Comp {...{ ...props, location}} key={`${location.pathname}${location.search}`} />);
