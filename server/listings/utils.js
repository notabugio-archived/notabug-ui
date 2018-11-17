import * as SOULS from "../notabug-peer/souls";
import { prop, uniq, map, filter, compose } from "ramda";
import { query, all } from "../notabug-peer/scope";
import { filterThings, multiAuthor, } from "../queries";

export const LISTING_SIZE = 1000;

export const serializeListing = ({ name="", things }) => ({
  name,
  ids: things.map(prop("id")).filter(id => !!id).join("+")
});

export const curate = query((scope, authorIds, submissionOnly = false) =>
  all([
    multiAuthor(scope, {
      type: "comments",
      authorIds: authorIds
    })
      .then(souls =>
        all(
          souls
            .filter(x => !!x)
            .map(soul => scope.get(`${soul}/data`).then(x => x))
        )
      )
      .then(
        compose(
          map(submissionOnly ? prop("opId") : prop("replyToId")),
          filter(itemData => {
            if (!itemData) return;
            // if (submissionOnly && itemData.opId !== itemData.replyToId) return;
            return !!itemData.replyToId;
          })
        )
      ),
    multiAuthor(scope, {
      type: "submitted",
      authorIds: authorIds
    }).then(map(soul => SOULS.thing.isMatch(soul).thingid))
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
