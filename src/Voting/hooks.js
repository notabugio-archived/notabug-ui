import React, { createContext, useState, useCallback, useEffect, useContext, useMemo } from "react";
import { identity, assoc, dissoc, prop } from "ramda";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { PREFIX } from "notabug-peer";
import { NabContext } from "NabContext";
import { doWork } from "./pow";

export const VotingQueueContext = createContext();

export const VotingQueue = ({ children }) => (
  <VotingQueueContext.Provider value={useVotingQueue()}>{children}</VotingQueueContext.Provider>
);

export const useVotingQueue = () => {
  const { api } = useContext(NabContext);
  const [voteQueue, setVotingQueue] = useState({});
  const [currentVote, setCurrentVote] = useState(null);

  const onPauseQueue = useCallback(evt => {
    evt && evt.preventDefault();
    currentVote && currentVote.terminate();
    setCurrentVote(null);
  }, [currentVote]);

  const onResetQueue = useCallback(evt => {
    evt && evt.preventDefault();
    setVotingQueue({});
    onPauseQueue();
  }, [onPauseQueue]);

  const onDequeueVote = useCallback(id => {
    setVotingQueue(dissoc(id));
  }, []);

  const onQueueVote = useCallback((id, type) => {
    if (prop(id, voteQueue) === type) return onDequeueVote(id);
    setVotingQueue(assoc(id, type));
  }, [voteQueue]);

  const onResumeQueue = useCallback(evt => {
    evt && evt.preventDefault();
    const nextId = Object.keys(voteQueue).pop();
    if (currentVote || !nextId) return Promise.resolve();
    const type = voteQueue[nextId];
    if (!type) return Promise.resolve();
    const workPromise = doWork(`${PREFIX}/things/${nextId}/votes${type}`);
    setCurrentVote(workPromise);
    return workPromise
      .then(nonce => api.vote(nextId, type, nonce))
      .then(() => {
        onDequeueVote(nextId);
        setCurrentVote(null);
      })
      .catch(error => error && console.error(error.stack || error));
  }, [currentVote, voteQueue]);

  useEffect(() => {
    onResumeQueue();
  }, [voteQueue]);

  const val = { currentVote, voteQueue, onResumeQueue, onPauseQueue, onResetQueue, onQueueVote, onDequeueVote };
  return useMemo(() => val, Object.values(val));
};

export const useVotable = ({ id }) => {
  const { voteQueue, onQueueVote } = useContext(VotingQueueContext);
  const isVoting = voteQueue[id];
  const isVotingUp = isVoting && isVoting === "up";
  const isVotingDown = isVoting && isVoting === "down";

  const onVoteUp = useCallback(() => {
    onQueueVote(id, "up");
  }, [id, onQueueVote]) || identity; // useCallback returns falsey in node

  const onVoteDown = useCallback(() => {
    onQueueVote(id, "down");
  }, [id, onQueueVote]) || identity; // useCallback returns falsey in node

  return { isVotingUp, isVotingDown, onVoteUp, onVoteDown };
};

