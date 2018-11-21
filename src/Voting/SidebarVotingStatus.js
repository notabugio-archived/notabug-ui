import React, { useContext } from "react";
import { VotingQueueContext } from "./hooks";
import Spinner from "react-spinkit";

export const SidebarVotingStatus = ({ color = "#cee3f8" }) => {
  const {
    voteQueue,
    currentVote,
    onPauseQueue,
    onResumeQueue,
    onResetQueue
  } = useContext(VotingQueueContext);
  const votingCount = Object.keys(voteQueue).length;
  if (!votingCount) return null;
  return (
    <div className="spacer">
      <div className="sidecontentbox">
        <div className="title">
          {currentVote ? (
            <h1>
              CPU Voting on {votingCount} item{votingCount === 1 ? "" : "s"}
            </h1>
          ) : (
            <h1>
              CPU Voting Paused ({votingCount} item
              {votingCount === 1 ? "" : "s"})
            </h1>
          )}
        </div>
        <div className="content">
          <p>Votes use Proof of Work without cryptocurrency</p>
          {currentVote ? (
            <Spinner
              style={{ float: "left" }}
              name="three-bounce"
              fadeIn="none"
              color={color}
            />
          ) : null}
          <div className="more">
            {currentVote ? (
              <a href="" onClick={onPauseQueue}>
                pause
              </a>
            ) : (
              <a href="" onClick={onResumeQueue}>
                resume
              </a>
            )}{" "}
            |{" "}
            <a href="" onClick={onResetQueue}>
              cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
