import { withRouter } from "react-router-dom";
import { injectState } from "freactal";
import { Page as PageBase } from "Page/Page";

export const Page = withRouter(injectState(PageBase));
