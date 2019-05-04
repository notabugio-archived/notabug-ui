import { Page } from "@notabug/peer";
import { cached } from "/utils";
import { Page as PageComponent } from "/Page";
import { Reddit } from "/static";
import { LoginSignupPage } from "/Auth";
import { SubmissionForm } from "/Submission/Form";
import { WikiPage } from "/Wiki";

const CachedPage = PageComponent || cached(PageComponent);
const SubmitPage = SubmissionForm || cached(SubmissionForm);

export const paths = [
  ["/help/:name", Page.wikiPage({ component: WikiPage })],
  ["/r/*", { component: Reddit }],
  ["/submit", Page.spaceListing({ name: "frontpage", component: SubmitPage })],
  ["/login", { component: LoginSignupPage }],
  ["/message/inbox", Page.inbox({ component: PageComponent })],
  ["/:prefix/:identifier/submit", Page.listing({ component: SubmitPage })],
  [
    "/:prefix/:identifier/comments/:opId/:slug",
    Page.thingComments({ component: CachedPage })
  ],
  [
    "/:prefix/:identifier/comments/:opId",
    Page.thingComments({ component: CachedPage })
  ],
  ["/user/:authorId/pages/:name", Page.wikiPage({ component: WikiPage })],
  [
    "/user/:authorId/spaces/:name/submit",
    Page.spaceListing({ component: SubmitPage })
  ],
  [
    "/user/:authorId/spaces/:name/comments/:opId/:slug",
    Page.spaceThingComments({ component: CachedPage })
  ],
  [
    "/user/:authorId/spaces/:name/comments/:opId",
    Page.spaceThingComments({ component: CachedPage })
  ],
  [
    "/user/:authorId/spaces/:name/:sort",
    Page.spaceListing({ component: CachedPage })
  ],
  [
    "/user/:authorId/spaces/:name",
    Page.spaceListing({ component: CachedPage })
  ],
  ["/user/:authorId/:type/:sort", Page.profile({ component: CachedPage })],
  ["/user/:authorId/:type", Page.profile({ component: CachedPage })],
  ["/user/:authorId", Page.profile({ component: CachedPage })],
  ["/:prefix/:identifier/:sort", Page.listing({ component: CachedPage })],
  ["/:prefix/:identifier", Page.listing({ component: PageComponent })],
  ["/:sort", Page.spaceListing({ name: "frontpage", component: CachedPage })],
  [
    "/",
    Page.spaceListing({
      exact: true,
      name: "frontpage",
      component: CachedPage
    })
  ]
];
