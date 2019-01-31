import { query, all, resolve } from "gun-scope";
import { routes } from "../notabug-peer/json-schema";
import { COMMAND_RE } from "../notabug-peer/constants";
import { keys, prop, uniq, map, filter, compose } from "ramda";
import * as R from "ramda";
import { filterThings, multiAuthor } from "../queries";

export const LISTING_SIZE = 1000;
export const serialize = ({ name = "", things, stickyIds = [] }) => ({
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

export const isReplyToOp = ({ opId, replyToId } = {}) => opId === replyToId;
export const isCommand = R.compose(
  R.test(COMMAND_RE),
  R.prop("body")
);
export const uniqueByContent = R.uniqBy(
  compose(
    obj => JSON.stringify(obj),
    R.applySpec({
      author: R.path(["data", "author"]),
      title: R.path(["data", "title"]),
      body: R.path(["data", "body"]),
      url: R.path(["data", "url"])
    })
  )
);

const processCommands = R.pipe(
  R.sortWith([
    R.ascend(
      compose(
        parseInt,
        R.prop("timestamp")
      )
    )
  ]),
  R.filter(isCommand),
  R.map(
    compose(
      ({ id, timestamp, command }) => [[command, id], timestamp],
      R.applySpec({
        id: prop("replyToId"),
        timestamp: compose(
          parseInt,
          R.prop("timestamp")
        ),
        command: R.compose(
          R.prop(0),
          R.map(R.trim),
          R.split(" "),
          R.trim,
          R.replace(COMMAND_RE, ""),
          R.prop(0),
          R.split("\n"),
          R.prop("body")
        )
      })
    )
  ),
  R.reduce((res, [p, ts]) => R.assocPath(p, ts, res), {})
);

export const commands = query((scope, authorIds) =>
  multiAuthor(scope, { type: "commands", authorIds })
    .then(fetchThingSoulsData(scope))
    .then(
      R.pipe(
        R.filter(isReplyToOp),
        processCommands
      )
    )
);

export const moderate = R.curry((scope, moderators, things) => {
  if (!moderators.length) return resolve(things);
  return commands(scope, moderators).then(cmd => {
    const badIds = R.indexBy(
      R.identity,
      R.filter(
        id =>
          R.pathOr(0, ["remove", id], cmd) >= R.pathOr(0, ["approve", id], cmd),
        R.keys(R.prop("remove", cmd))
      )
    );
    if (!R.keys(badIds).length) return things;
    return filterThings(scope, things, thing => {
      if (!thing.data) return false;
      if (badIds[thing.id]) return false;
      if (badIds[thing.data.opId]) return false;
      return true;
    });
  });
});

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
          filter(prop("replyToId"))
        )
      ),
    multiAuthor(scope, {
      type: "submitted",
      authorIds
    }).then(map(soul => routes.Thing.match(soul).thingId))
  ]).then(([ids1, ids2]) => uniq([...ids1, ...ids2]))
);

export const censor = R.curry((scope, censors, things) => {
  if (!censors.length) return resolve(things);
  return curate(scope, censors)
    .then(R.indexBy(R.identity))
    .then(badIds =>
      keys(badIds).length
        ? filterThings(scope, things, thing => {
            if (!thing.data) return false;
            if (badIds[thing.id]) return false;
            if (badIds[thing.data.opId]) return false;
            return true;
          })
        : things
    );
});
