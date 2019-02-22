/* globals Gun */
import { query, all, resolve } from "gun-scope";
import { routes } from "../notabug-peer/json-schema";
import { COMMAND_RE } from "../notabug-peer/constants";
import { toFilters } from "../notabug-peer/source";
import { getWikiPageId, getWikiPage } from "../notabug-peer/listings";
import * as R from "ramda";
import { filterThings, multiAuthor } from "../queries";

export const LISTING_SIZE = 1000;

export const readSEA = rawData => {
  const data = rawData ? { ...rawData } : rawData;
  const soul = R.path(["_", "#"], data);
  if (!soul || !Gun.SEA || soul.indexOf("~") === -1) return rawData;
  R.without(["_"], R.keys(data)).forEach(key => {
    Gun.SEA.verify(
      Gun.SEA.opt.pack(rawData[key], key, rawData, soul),
      false,
      res => (data[key] = Gun.SEA.opt.unpack(res, key, rawData))
    );
  });
  return data;
};

export const spaceFromSoul = async (scope, soul) => {
  const spaceMatch = routes.SpaceListing.match(soul);
  const { authorId = null, name = null } = spaceMatch || {};
  const space = { pageId: null, page: null, owner: authorId, name };

  if (authorId && name) {
    space.pageId = await getWikiPageId(scope, authorId, `space:${name}`);
    space.page = await getWikiPage(scope, authorId, `space:${name}`);
  }

  space.def = toFilters(R.propOr("", "body", space.page), authorId, name);
  return space;
};

export const getEdgeIds = R.compose(
  R.filter(R.identity),
  R.map(
    R.compose(
      R.prop("thingId"),
      routes.Thing.match.bind(routes.Thing)
    )
  ),
  R.map(R.prop("#")),
  R.values
);

const reduce = R.addIndex(R.reduce);
export const serialize = ({ name = "", things, stickyIds = [] }) => ({
  name,
  size: things.length + stickyIds.length,
  ids: "",
  ...reduce(
    (res, id, idx) => R.assoc(`${idx}`, R.join(",", [id, -Infinity]), res),
    {},
    stickyIds
  ),
  ...R.compose(
    reduce(
      (res, data, idx) =>
        R.assoc(`${stickyIds.length + idx}`, R.join(",", data), res),
      {}
    ),
    R.map(
      R.compose(
        R.ap([R.prop("id"), R.prop("sortValue")]),
        R.of
      )
    )
  )(things.slice(0, LISTING_SIZE))
  /*
    ids: [...stickyIds, ...things.map(R.prop("id")).filter(id => !!id)].join(
      "+"
    )
    */
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
  R.compose(
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
      R.compose(
        parseInt,
        R.prop("timestamp")
      )
    )
  ]),
  R.filter(isCommand),
  R.map(
    R.compose(
      ({ id, timestamp, command }) => [[command, id], timestamp],
      R.applySpec({
        id: R.prop("replyToId"),
        timestamp: R.compose(
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
        R.compose(
          R.map(submissionOnly ? R.prop("opId") : R.prop("replyToId")),
          R.filter(R.prop("replyToId"))
        )
      ),
    multiAuthor(scope, {
      type: "submitted",
      authorIds
    }).then(R.map(soul => routes.Thing.match(soul).thingId))
  ]).then(([ids1, ids2]) => R.uniq([...ids1, ...ids2]))
);

export const censor = R.curry((scope, censors, things) => {
  if (!censors.length) return resolve(things);
  return curate(scope, censors)
    .then(R.indexBy(R.identity))
    .then(badIds =>
      R.keys(badIds).length
        ? filterThings(scope, things, thing => {
            if (!thing.data) return false;
            if (badIds[thing.id]) return false;
            if (badIds[thing.data.opId]) return false;
            return true;
          })
        : things
    );
});
