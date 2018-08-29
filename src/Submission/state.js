import React from "react";
import { compose } from "ramda";
import { votingItemProvider } from "Voting";

export const submissionSummaryProvider = compose(
  Comp => (props) => <Comp {...{...props, votableId: props.id}} />,
  votingItemProvider,
);
