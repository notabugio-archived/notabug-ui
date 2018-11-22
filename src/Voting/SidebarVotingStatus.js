import React, { useContext, useState } from "react";
import { VotingQueueContext } from "./hooks";
import Spinner from "react-spinkit";
import VisibilitySensor from "react-visibility-sensor";

export const SidebarVotingStatus = React.memo(({ color = "#FF8B60" }) => {
  const {
    voteQueue,
    currentVote,
    onPauseQueue,
    onResumeQueue,
    onResetQueue
  } = useContext(VotingQueueContext);
  const votingCount = Object.keys(voteQueue).length;
  if (!votingCount) return null;
  const [isVisible, setIsVisible] = useState(true);

  const content = (
    <React.Fragment>
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
    </React.Fragment>
  );

  return (
    <VisibilitySensor onChange={setIsVisible}>
      <div className="spacer">
        <div className="sidecontentbox">{content}</div>
        {isVisible ? null : (
          <div className="sidecontentbox vote-status-fixed">{content}</div>
        )}
      </div>
    </VisibilitySensor>
  );
});
