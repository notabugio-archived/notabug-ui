import React from "react";
import HeaderComponent from "./Header";
import SidebarComponent from "./Sidebar";
import FooterParentComponent from "./FooterParent";
import LoadingComponent from "./Loading";
import { optional } from "../util";

export const Subreddit = ({
  Loading = LoadingComponent,
  Header = HeaderComponent,
  Sidebar = SidebarComponent,
  FooterParent = FooterParentComponent,
  children,
  isLoading,
  subreddit,
  style,
  useSidebar=true,
  useStyle,
  ...props
}) => ([
  (useStyle && style.stylesheet) ? <style key="style">{style.stylesheet}</style> : null,
  optional(Header, { ...props, key: "header", subreddit }),
  useSidebar ? optional(Sidebar, { ...props, subreddit, key: "sidebar" }) : null,
  <a name="content" key="anchor" />,
  children,
  optional(FooterParent, { ...props, key: "footer" }),
  isLoading ? optional(Loading, { ...props, key: "loading" }) : null,
  <img id="hsts_pixel" key="hsts_pixel" />,
  <p className="bottommenu debuginfo" key="debuginfo">,
    <span className="icon">π</span> <span className="content">
      Rendered by go1dfish on open-source-reddit at 2017-10-22 02:55:43.787032+00:00
      running 753b174 .
    </span>
  </p>
]);

export default Subreddit;
