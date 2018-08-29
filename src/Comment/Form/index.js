import { commentFormProvider } from "./state";
import { injectState } from "freactal";
import { CommentForm as CommentFormComponent } from "./CommentForm";

export const CommentForm = commentFormProvider(injectState(CommentFormComponent));
