import React, { Fragment } from "react";
import { notabug, notabugVoteQueue } from "state/notabug";

export const Provider = notabug(notabugVoteQueue(
  ({ children }) => <Fragment>{children}</Fragment>
));
