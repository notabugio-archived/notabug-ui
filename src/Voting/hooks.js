import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
  useMemo
} from "react";
import { identity, assoc, dissoc, prop } from "ramda";
import { Constants } from "@notabug/peer";
import { useNotabug } from "/NabContext";
import { doWork } from "./pow";

export const VotingQueueContext = createContext();

export const useVotingQueue = () => {
  const { api } = useNotabug();
  const [voteQueue, setVotingQueue] = useState({});
  const [currentVote, setCurrentVote] = useState(null);
  const [numCores, setNumCores] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const terminateVote = useCallback(
    () => {
      currentVote && currentVote.terminate();
      setCurrentVote(null);
    },
    [currentVote]
  );

  const onPauseQueue = useCallback(
    evt => {
      evt && evt.preventDefault();
      setIsPaused(true)
      terminateVote()
    },
    [currentVote, isPaused]
  );

  const onUnpauseQueue = useCallback(
    evt => {
      evt && evt.preventDefault()
      setIsPaused(false)
    },
    [currentVote, isPaused]
  )

  const onChangeNumCores = useCallback(
    cores => {
      if(cores == numCores)
        return
      terminateVote()
      setNumCores(cores)
    },
    [currentVote, numCores]
  )

  const onResetQueue = useCallback(
    evt => {
      evt && evt.preventDefault();
      setVotingQueue({});
      terminateVote()
      onUnpauseQueue()
    },
    [onUnpauseQueue]
  );

  const onDequeueVote = useCallback(id => {
    setVotingQueue(dissoc(id));
  }, []);

  const onQueueVote = useCallback(
    (id, type) => {
      if (prop(id, voteQueue) === type) return onDequeueVote(id);
      return setVotingQueue(assoc(id, type));
    },
    [voteQueue]
  );

  const onResumeQueue = useCallback(
    evt => {
      evt && evt.preventDefault();
      const nextId = Object.keys(voteQueue).pop();

      if (isPaused || currentVote || !nextId) return Promise.resolve();
      const type = voteQueue[nextId];

      if (!type) return Promise.resolve();

      const workPromise = doWork(
        `${Constants.PREFIX}/things/${nextId}/votes${type}`,
        numCores
      );

      setCurrentVote(workPromise);
      return workPromise
        .then(nonce => api.vote(nextId, type, nonce))
        .then(() => {
          setCurrentVote(null);
          onDequeueVote(nextId);
        })
        .catch(error => error && console.error(error.stack || error));
    },
    [currentVote, voteQueue, numCores, isPaused]
  );

  useEffect(() => {
    onResumeQueue();
  }, [voteQueue, numCores, isPaused]);

  const val = {
    currentVote,
    voteQueue,
    numCores,
    onResumeQueue,
    onPauseQueue,
    onUnpauseQueue,
    onResetQueue,
    onQueueVote,
    onDequeueVote,
    onChangeNumCores
  };

  return useMemo(() => val, Object.values(val));
};

export const VotingQueue = ({ children }) => (
  <VotingQueueContext.Provider value={useVotingQueue()}>
    {children}
  </VotingQueueContext.Provider>
);

export const useVotable = ({ id }) => {
  const { voteQueue, onQueueVote } = useContext(VotingQueueContext);
  const isVoting = voteQueue[id];
  const isVotingUp = isVoting && isVoting === "up";
  const isVotingDown = isVoting && isVoting === "down";

  const onVoteUp =
    useCallback(() => {
      onQueueVote(id, "up");
    }, [id, onQueueVote]) || identity; // useCallback returns falsey in node

  const onVoteDown =
    useCallback(() => {
      onQueueVote(id, "down");
    }, [id, onQueueVote]) || identity; // useCallback returns falsey in node

  return { isVotingUp, isVotingDown, onVoteUp, onVoteDown };
};
