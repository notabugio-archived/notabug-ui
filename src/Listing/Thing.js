import React, { useState, useContext, useCallback, useEffect } from "react";
import * as R from "ramda";
import { Loading, useQuery } from "utils";
import { Config, Query, Schema } from "notabug-peer";
import { useNotabug } from "NabContext";
import { Submission } from "Submission";
import { Comment } from "Comment";
import { ChatMsg } from "Chat/ChatMsg";
import { WikiPageContent } from "Wiki/PageContent";
import { useVotable } from "Voting";

const components = {
  submission: Submission,
  wikipage: WikiPageContent,
  comment: Comment,
  chatmsg: ChatMsg
};

export const Thing = React.memo(
  ({
    Loading: LoadingComponent = Loading,
    ListingContext,
    id,
    name,
    rank,
    disableChildren,
    fetchParent,
    hideReply = false,
    expanded: expandedProp = false,
    isDetail,
    asSource,
    onDidUpdate
  }) => {
    const { api, me, myContent } = useNotabug();
    const {
      indexer = Config.indexer,
      tabulator = Config.tabulator,
      speculativeIds = {}
    } = useContext(ListingContext || {}) || {};
    const isSpeculative = speculativeIds[id];
    const [scores] = useQuery(Query.thingScores, [id, tabulator || indexer]);
    const [item] = useQuery(Query.thingData, [id]);
    const parentId = R.propOr(null, "opId", item);
    const [parentItem] = useQuery(Query.thingData, [parentId]);

    const isMine = !!myContent[id];
    const [isShowingReply, setIsShowingReply] = useState(false);
    const [expanded, setExpanded] = useState(expandedProp);
    const { isVotingUp, isVotingDown, onVoteUp, onVoteDown } = useVotable({
      id
    });

    let body = R.propOr("", "body", item) || "";

    if (!body.split) body = JSON.stringify(body);
    const lineCount = body.length / 100 + body.split("\n").length - 1;
    const collapseThreshold = lineCount / 10.0 - 4;

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

    useEffect(() => {
      onDidUpdate && onDidUpdate();
    }, [item, parentItem]);

    const score = parseInt(R.prop("score", scores), 10) || 0;
    const ThingComponent = item ? components[item.kind] : null;
    const collapsed =
      !isMine && !!(collapseThreshold !== null && score < collapseThreshold);
    const tsts = R.path(["_", ">", "timestamp"], item);
    const bodyts = R.path(["_", ">", "body"], item);
    const edited = tsts !== bodyts && bodyts;

    const soul = R.path(["_", "#"], item);
    const signedMatch = Schema.ThingDataSigned.route.match(soul);
    const canEdit =
      me && signedMatch && me.pub === `${signedMatch.authorId}` && soul;
    const [isEditing, setIsEditing] = useState(false);
    const [editedBody, setEditedBody] = useState(R.propOr("", "body", item));

    useEffect(() => {
      setEditedBody(R.propOr("", "body", item));
    }, [R.propOr("", "body", item)]);

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
      ups: R.propOr(0, "up", scores),
      downs: R.propOr(0, "down", scores),
      score: R.propOr(0, "score", scores),
      comments: R.propOr(0, "comment", scores),
      edited,
      canEdit,
      isEditing,
      editedBody,
      onChangeEditedBody,
      onSubmitEdit,
      onToggleEditing: canEdit && onToggleEditing,
      rank,
      id,
      name,
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
      asSource,
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
