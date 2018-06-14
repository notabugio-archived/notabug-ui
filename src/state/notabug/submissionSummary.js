import React from "react";
import compose from "ramda/es/compose";
import { notabugVotable } from "./votable";

export const notabugSubmissionSummary = compose(
  Comp => (props) => <Comp {...{...props, votableId: props.id}} />,
  notabugVotable,
);
