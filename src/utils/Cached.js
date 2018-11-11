import React, { useContext, useEffect } from "react";
import isNode from "detect-node";
import { NabContext } from "NabContext";
import { locationKey } from "./locationKey";

let hasBooted = false;
let renderedLocation = null;
if (!isNode) renderedLocation = window.initNabState && window.location;

const Cached = ({ location: { pathname, search }, Wrapped, ...props }) => {
  const { onFetchCache } = useContext(NabContext);

  useEffect(
    () => {
      if (!hasBooted && renderedLocation) {
        if (
          pathname === renderedLocation.pathname &&
          search == renderedLocation.search
        ) {
          hasBooted = true;
          return;
        }
      }
      onFetchCache(pathname, search);
    },
    [pathname, search]
  );

  return <Wrapped {...props} />;
};

export const cached = Wrapped =>
  locationKey(p => <Cached {...{ Wrapped }} {...p} />);
