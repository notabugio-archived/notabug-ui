import { always, identity } from "ramda";
import { provideState, update } from "freactal";
import { COMMENT_BODY_MAX } from "lib/nab/validate";

const initialState = () => ({
  commentBody: ""
});

const getCommentFormState = always(identity);

const onChangeCommentBody = update((state, commentBody) => ({ commentBody }));

const onSaveComment = (effects) => effects.getCommentFormState()
  .then((state) => {
    if (isCommentTooLong(state)) return;
    return effects.onNotabugSaveComment(state.commentBody)
      .then(() => effects.onChangeCommentBody(""));
  })
  .then(getCommentFormState);

const isCommentTooLong = ({ commentBody }) => commentBody.length > COMMENT_BODY_MAX;

export const notabugCommentForm = provideState({
  initialState,
  effects: {
    getCommentFormState,
    onChangeCommentBody,
    onSaveComment
  },
  computed: { isCommentTooLong }
});
