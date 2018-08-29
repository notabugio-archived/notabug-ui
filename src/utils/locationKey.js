import React from "react";
import { withRouter } from "react-router-dom";

export const locationKey = Comp => withRouter(
  ({ location: { pathname, search } , ...props }) =>
    <Comp {...props} key={`${pathname}${search}`} />);
