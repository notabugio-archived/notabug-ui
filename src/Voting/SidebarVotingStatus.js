import React, { useContext, useState } from "react";
import { VotingQueueContext } from "./hooks";
import { Spinner } from "/utils/Spinner";
import VisibilitySensor from "react-visibility-sensor";
import { Range } from "react-range";

const MAX_CORES = navigator.hardwareConcurrency || 1;

function CoreSlider({ cores, onChange }) {
  const [numCores, setNumCores] = useState([cores])

  return (
    <div className="vote-cores-slider">
      <p>
        CPU cores used for voting: { numCores[0] }
      </p>
      <Range
        values={ numCores }
        step={ 1 }
        min={ 1 }
        max={ MAX_CORES }
        onChange={cores => {
          setNumCores(cores)
        }}
        onFinalChange={cores => {
          onChange && onChange(cores[0])
        }}
        renderTrack={({ props, children }) => (
          <div
            className="vote-cores-slidertrack"
            {...props}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            className="vote-cores-sliderthumb"
            {...props}
          />
        )}
      />
    </div>
  )
}

export const SidebarVotingStatus = React.memo(({ color = "#FF8B60" }) => {
  const ctx = useContext(VotingQueueContext);
  const {
    voteQueue,
    currentVote,
    numCores,
    onPauseQueue,
    onUnpauseQueue,
    onResumeQueue,
    onResetQueue,
    onChangeNumCores
  } = ctx || {};
  const votingCount = Object.keys(voteQueue || {}).length;
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  if ((!votingCount || !ctx) && !isHovered) return null;

  const content = (
    <React.Fragment>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
            {MAX_CORES > 1 ? (
              <CoreSlider
                cores={numCores}
                onChange={onChangeNumCores}
              />
            ) : null}
            {currentVote ? (
              <button onClick={onPauseQueue}>
                pause
              </button>
            ) : (
              <button onClick={onUnpauseQueue} disabled={votingCount > 0 ? null : "disabled"}>
                resume
              </button>
            )}
            <button onClick={onResetQueue} disabled={votingCount > 0 ? null : "disabled"}>
              cancel
            </button>
          </div>
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
