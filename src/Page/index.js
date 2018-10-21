import { withRouter } from "react-router-dom";
import { injectState } from "freactal";
import { Page as PageBase } from "Page/Page";

export { PageTemplate } from "./Template";
export { PageFooter } from "./Footer";
export const Page = withRouter(injectState(PageBase));
