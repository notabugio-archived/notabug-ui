import React from "react";
import { compose } from "ramda";
import { notabugVotable } from "./votable";

export const notabugSubmissionSummary = compose(
  Comp => (props) => <Comp {...{...props, votableId: props.id}} />,
  notabugVotable,
);
