import React, { useContext, useState } from "react";
import { VotingQueueContext } from "./hooks";
import Spinner from "react-spinkit";
import VisibilitySensor from "react-visibility-sensor";

export const SidebarVotingStatus = React.memo(({ color = "#FF8B60" }) => {
  const ctx = useContext(VotingQueueContext);
  const {
    voteQueue,
    currentVote,
    onPauseQueue,
    onResumeQueue,
    onResetQueue
  } = ctx || {};
  const votingCount = Object.keys(voteQueue || {}).length;
  const [isVisible, setIsVisible] = useState(true);

  if (!votingCount || !ctx) return null;

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
            <button onClick={onPauseQueue}>
              pause
            </button>
          ) : (
            <button onClick={onResumeQueue}>
              resume
            </button>
          )}
          <button onClick={onResetQueue}>
            cancel
          </button>
        </div>
      </div>
    </React.Fragment>
  );

  return (
    <VisibilitySensor onChange={setIsVisible}>
      <div className="spacer">
        <div className="sidecontentbox vote-status">{content}</div>
        {isVisible ? null : (
          <div className="sidecontentbox vote-status vote-status-fixed">{content}</div>
        )}
      </div>
    </VisibilitySensor>
  );
});
