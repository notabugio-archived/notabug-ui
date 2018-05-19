import React, { Fragment } from "react";
import { notifications, notabug, notabugVoteQueue } from "state/notabug";

export const Provider = notifications(notabug(notabugVoteQueue(
  ({ children }) => <Fragment>{children}</Fragment>
)));
