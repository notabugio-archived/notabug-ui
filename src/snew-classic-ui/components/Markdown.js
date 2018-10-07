import React from "react";

const Markdown = ({ html, className }) =>
  html ? (
    <div
      className="usertext-body may-blank-within md-container"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : null;

export default Markdown;

