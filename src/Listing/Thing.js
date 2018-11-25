import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect
} from "react";
import { propOr, path } from "ramda";
import { Loading } from "utils";
import { NabContext, useScope } from "NabContext";
import { Submission } from "Submission";
import { Comment } from "Comment";
import { ChatMsg } from "Chat/ChatMsg";
import { useVotable } from "Voting";
//import debounce from "lodash/debounce";

const components = {
  submission: Submission,
  comment: Comment,
  chatmsg: ChatMsg
};

export const Thing = React.memo(
  ({
    Loading: LoadingComponent = Loading,
    ListingContext,
    id,
    rank,
    disableChildren,
    fetchParent,
    hideReply = false,
    expanded: expandedProp = false,
    isDetail,
    onDidUpdate
  }) => {
    const { api, me, myContent } = useContext(NabContext);
    const {
      listingParams: { indexer },
      speculativeIds
    } = useContext(ListingContext);
    const isSpeculative = speculativeIds[id];

    const scope = useScope();
    const isMine = !!myContent[id];
    const { initialScores, initialItem, initialParentItem } = useMemo(() => {
      const initialScores = api.queries.thingScores.now(scope, indexer, id) || {
        up: 0,
        down: 0,
        score: 0,
        comment: 0
      };
      const initialItem = api.queries.thingData.now(scope, id);
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
    const collapseThreshold = lineCount / 3.0 - 4;

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

    const doUpdate = useCallback(
      () => {
        const updatedScores = api.queries.thingScores.now(scope, indexer, id);
        const updatedItem = api.queries.thingData.now(scope, id);
        const updatedParentItem =
          fetchParent && updatedItem && updatedItem.opId
            ? api.queries.thingData.now(scope, updatedItem.opId)
            : null;

        updatedScores && setScores(updatedScores);
        updatedItem && setItem(updatedItem);
        updatedParentItem && setParentItem(updatedParentItem);
      },
      [scope, id, indexer, fetchParent, item, parentItem]
    );

    useEffect(
      () => {
        //const update = debounce(doUpdate, 50);
        scope.on(doUpdate);
        return () => scope.off(doUpdate);
      },
      [doUpdate]
    );

    useEffect(
      () => {
        onDidUpdate && onDidUpdate();
      },
      [item, parentItem]
    );

    const score = parseInt(scores.score) || 0;
    const ThingComponent = item ? components[item.kind] : null;
    const collapsed =
      !isMine && !!(collapseThreshold !== null && score < collapseThreshold);
    const tsts = path(["_", ">", "timestamp"], item);
    const bodyts = path(["_", ">", "body"], item);
    const edited = tsts !== bodyts && bodyts;

    const soul = path(["_", "#"], item);
    const signedMatch = api.souls.thingDataSigned.isMatch(soul);
    const canEdit =
      me &&
      signedMatch &&
      me.pub === `${signedMatch.id1}.${signedMatch.id2}` &&
      soul;
    const [isEditing, setIsEditing] = useState(false);
    const [editedBody, setEditedBody] = useState(propOr("", "body", item));

    useEffect(
      () => {
        setEditedBody(propOr("", "body", item));
      },
      [propOr("", "body", item)]
    );

    const onToggleEditing = useCallback(evt => {
      evt && evt.preventDefault();
      setIsEditing(editing => !editing);
    }, []);

    const onChangeEditedBody = useCallback(evt => {
      setEditedBody(evt.target.value);
    }, []);

    const onSubmitEdit = useCallback(
      evt => {
        evt && evt.preventDefault();
        if (!canEdit) return;
        api.gun
          .get(canEdit)
          .get("body")
          .put(editedBody);
        setIsEditing(false);
      },
      [editedBody, canEdit]
    );

    if (item && !ThingComponent) return null;

    const thingProps = {
      ListingContext,
      ups: scores.up,
      downs: scores.down,
      score: scores.score,
      comments: scores.comment,
      edited,
      canEdit,
      isEditing,
      editedBody,
      onChangeEditedBody,
      onSubmitEdit,
      onToggleEditing: canEdit && onToggleEditing,
      rank,
      id,
      item,
      fetchParent,
      parentItem,
      isSpeculative,
      expanded,
      collapsed,
      collapseThreshold,
      isShowingReply,
      hideReply,
      isDetail,
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
        <LoadingComponent {...{ ...thingProps, isVisible }} />
      ) : (
        <ThingComponent {...{ ...thingProps, isVisible }} />
      );
    return renderComponent({ isVisible: true });
  }
);
