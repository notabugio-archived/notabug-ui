import React, { useCallback } from "react";
import urllite from "urllite";
import { equals } from "ramda";

export const interceptClicks = (
  ToWrap, domainsToIntercept=["www.notabug.io", "notabug.io", "localhost"]
) =>
  function ClickInterceptor(props) {
    const onClick = useCallback((e) => {
      let el = e.target;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || (e.button !== 0)) return;
      while (el && el.nodeName !== "A") el = el.parentNode;
      if (!el || el.attributes.download) return;
      if (el.rel && /(?:^|\s+)external(?:\s+|$)/.test(el.rel)) return;
      const url = urllite(el.href);
      const windowURL = urllite(window.location.href);
      const path = url.pathname
        + (url.search.length > 1 ? url.search : "")
        + (url.hash.length > 1 ? url.hash : "");
      if (url.host !== windowURL.host && !domainsToIntercept.find(equals(url.host.toLowerCase()))) return;
      props.history.push(path);
      el.blur();
      e.preventDefault();
    }, [props.history]);

    return <ToWrap {...{...props, onClick }} />;
  };
