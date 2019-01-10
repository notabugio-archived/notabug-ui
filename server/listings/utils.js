import { routes } from "../notabug-peer/json-schema";
import { prop, uniq, map, filter, compose } from "ramda";
import { query, all } from "../notabug-peer/scope";
import { filterThings, multiAuthor } from "../queries";

export const LISTING_SIZE = 1000;

export const serializeListing = ({ name = "", things, stickyIds = [] }) => ({
  name,
  ids: [...stickyIds, ...things.map(prop("id")).filter(id => !!id)].join("+")
});

const fetchThingSoulsData = scope => souls =>
  all(
    souls
      .filter(x => !!x)
      .map(soul =>
        scope
          .get(soul)
          .get("data")
          .then(x => x)
      )
  );

export const curate = query((scope, authorIds, submissionOnly = false) =>
  all([
    multiAuthor(scope, {
      type: "comments",
      authorIds
    })
      .then(fetchThingSoulsData(scope))
      .then(
        compose(
          map(submissionOnly ? prop("opId") : prop("replyToId")),
          filter(itemData => {
            if (!itemData) return;
            return itemData && !!itemData.replyToId;
          })
        )
      ),
    multiAuthor(scope, {
      type: "submitted",
      authorIds
    }).then(map(soul => routes.Thing.match(soul).thingid))
  ]).then(([ids1, ids2]) => uniq([...ids1, ...ids2]))
);

export const censor = (scope, censors, things) =>
  curate(scope, censors)
    .then(ids => {
      const bad = {};
      ids.forEach(id => (bad[id] = true));
      return bad;
    })
    .then(badIds =>
      filterThings(scope, things, thing => {
        if (!thing.data) return false;
        if (badIds[thing.id]) return false;
        if (badIds[thing.data.opId]) return false;
        return true;
      })
    );
