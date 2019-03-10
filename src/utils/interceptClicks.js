import React, { useCallback } from "react";
import { parse as parseURI } from "uri-js";
import { equals } from "ramda";

export const interceptClicks = (
  ToWrap,
  domainsToIntercept = ["www.notabug.io", "notabug.io", "localhost"]
) =>
  function ClickInterceptor(props) {
    const onClick = useCallback(
      e => {
        let el = e.target;

        if (
          e.defaultPrevented ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.button !== 0
        )
          return;
        while (el && el.nodeName !== "A") el = el.parentNode;
        if (!el || el.attributes.download) return;
        // if (el.rel && /(?:^|\s+)external(?:\s+|$)/.test(el.rel)) return;
        const url = parseURI(el.href);
        const windowURL = parseURI(window.location.href);
        const path =
          url.path +
          (url.query ? `?${url.query}` : "") +
          (url.fragment ? `#${url.fragment}` : "");

        if (
          url.host !== windowURL.host &&
          !domainsToIntercept.find(equals(url.host.toLowerCase()))
        )
          return;
        props.history.push(path);
        el.blur();
        e.preventDefault();
      },
      [props.history]
    );

    return <ToWrap {...{ ...props, onClick }} />;
  };
