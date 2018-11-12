import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect
} from "react";
import { ZalgoPromise as Promise } from "zalgo-promise";
import { propOr } from "ramda";
import { Loading } from "utils";
import { NabContext, useScope } from "NabContext";
import { Submission } from "Submission";
import { Comment } from "Comment";
import { ChatMsg } from "Chat/ChatMsg";
import { useVotable } from "Voting";

const components = {
  submission: Submission,
  comment: Comment,
  chatmsg: ChatMsg
};

export const Thing = React.memo(
  ({
    id,
    data,
    topic,
    listingParams,
    fetchParent,
    rank,
    disableChildren,
    replyTree,
    hideReply = false,
    expanded: expandedProp = false,
    Loading: LoadingComponent = Loading,
    onDidUpdate
  }) => {
    const { api, myContent } = useContext(NabContext);
    const scope = useScope();
    const { indexer } = listingParams;
    const isMine = !!myContent[id];
    const { initialScores, initialItem, initialParentItem } = useMemo(() => {
      const initialScores = api.queries.thingScores.now(scope, indexer, id) || {
        up: 0,
        down: 0,
        score: 0,
        comment: 0
      };
      const initialItem = data || api.queries.thingData.now(scope, id);
      const initialParentItem =
        fetchParent && initialItem && initialItem.opId
          ? api.queries.thingData.now(scope, initialItem.opId)
          : null;
      return { initialScores, initialItem, initialParentItem };
    }, []);
    const [scores, setScores] = useState(initialScores);
    const [item, setItem] = useState(initialItem);
    const [parentItem, setParentItem] = useState(initialParentItem);
    const [isShowingReply, setIsShowingReply] = useState(false);
    const [expanded, setExpanded] = useState(expandedProp);
    const { isVotingUp, isVotingDown, onVoteUp, onVoteDown } = useVotable({
      id
    });

    const body = propOr("", "body", item) || "";
    const lineCount = body.length / 100 + body.split("\n").length - 1;
    const collapseThreshold = (lineCount - 4) / 2.0;

    const onToggleExpando = useCallback(
      evt => {
        evt && evt.preventDefault();
        expanded ? setExpanded(false) : setExpanded(true);
      },
      [expanded]
    );

    const onShowReply = useCallback(evt => {
      evt && evt.preventDefault();
      setIsShowingReply(true);
    }, []);

    const onHideReply = useCallback(evt => {
      evt && evt.preventDefault();
      setIsShowingReply(false);
    }, []);

    const doFetchParentItem = useCallback(
      opId => {
        if (parentItem) return Promise.resolve(parentItem);
        return api.queries.thingData(scope, opId).then(updatedItem => {
          if (!updatedItem) return;
          setParentItem(updatedItem);
        });
      },
      [parentItem]
    );

    const doFetchItem = useCallback(
      () =>
        (item ? Promise.resolve(item) : api.queries.thingData(scope, id)).then(
          updatedItem => {
            if (!updatedItem) return;
            const opId = propOr(null, "opId", updatedItem);
            setItem(updatedItem);
            return opId && doFetchParentItem(opId);
          }
        ),
      [item, id, fetchParent]
    );

    const doUpdateScores = useCallback(
      () => api.queries
        .thingScores(scope, indexer, id)
        .then(updatedScores => updatedScores && setScores(updatedScores)),
      [scope, id, indexer]
    );

    useEffect(
      () => {
        doUpdateScores();
        doFetchItem();
        scope.on(doUpdateScores);
        return () => scope.off(doUpdateScores);
      },
      [doUpdateScores]
    );

    useEffect(() => {
      onDidUpdate && onDidUpdate();
    }, [item, parentItem]);

    const score = scores.score || 0;
    const ThingComponent = item ? components[item.kind] : null;
    const collapsed =
      !isMine && !!(collapseThreshold !== null && score < collapseThreshold);
    if (item && !ThingComponent) return null;

    const thingProps = {
      listingParams,
      ups: scores.up,
      downs: scores.down,
      score: scores.score,
      comments: scores.comment,
      rank,
      id,
      item,
      topic,
      fetchParent,
      parentItem,
      replyTree,
      expanded,
      collapsed,
      collapseThreshold,
      isShowingReply,
      hideReply,
      isMine,
      isVotingUp,
      isVotingDown,
      onVoteUp,
      onVoteDown,
      onShowReply: disableChildren ? null : onShowReply,
      onHideReply,
      onToggleExpando
    };

    const renderComponent = ({ isVisible }) =>
      !item ? (
        <LoadingComponent {...thingProps} isVisible={isVisible} />
      ) : (
        <ThingComponent {...thingProps} isVisible={isVisible} />
      );
    return renderComponent({ isVisible: true });
  }
);
