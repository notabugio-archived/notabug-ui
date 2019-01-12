import React from "react";
import { prop } from "ramda";
import { SubmissionForm } from "Submission";
import { SpaceProvider } from "./Provider";
import { tabulator as defaultIndexer } from "../config.json";

export const SpaceSubmitPage = ({ spaceParams, ...props }) => {
  const owner = prop("owner", spaceParams) || defaultIndexer;
  const name = prop("name", spaceParams) || "frontpage";

  return (
    <SpaceProvider {...{ owner, name }}>
      <SubmissionForm {...props} />
    </SpaceProvider>
  );
};
