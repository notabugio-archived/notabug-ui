import React from "react";
import MarkdownDefault from "./Markdown";
import { optional } from "../util";

const Expando = ({
  Markdown = MarkdownDefault,
  expanded,
  is_self,
  selftext: body,
  selftext_html: html
}) => (
  <div className="expando">
    {expanded ? (
      is_self && body ? (
        <form className="usertext warn-on-unload">
          {optional(Markdown, { body, html, className: "usertext-body may-blank-within md-container" })}
        </form>
      ) : null
    ) : null}
  </div>
);

export default Expando;
