import React from "react";
import { identity } from "ramda";
import Snudown from "snuownd";
import { AllHtmlEntities } from "html-entities";
import { withRouter } from "react-router-dom";
export const entities = new AllHtmlEntities();

const interceptClicks = identity;

const parser = Snudown.getParser();

const MarkdownBase = ({ body, html, onClick, className = "usertext-body may-blank-within md-container" }) =>
  html
    ? (
      <div
        className={className}
        onClick={onClick}
        dangerouslySetInnerHTML={{__html: entities.decode(html) }}
      />
    ) : (
      <div className={className} onClick={onClick}>
        <div className="md" dangerouslySetInnerHTML={{__html: parser.render(entities.decode(body))}} />
      </div>
    );

export const Markdown = withRouter(interceptClicks(MarkdownBase));
