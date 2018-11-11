import { useEffect } from "react";
import { withRouter } from "react-router-dom";

export const ScrollToTop = withRouter(({ location, children }) => {
  useEffect(
    () => {
      window.scrollTo(0, 0);
    },
    [location]
  );
  return children;
});
