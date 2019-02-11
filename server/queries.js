import * as R from "ramda";
import { query, all, resolve } from "gun-scope";
import { getDayStr, PREFIX } from "./notabug-peer";
import { routes } from "./notabug-peer/json-schema";

const LISTING_SIZE = 1000;
const emptyPromise = resolve(null);
const unionArrays = R.reduce(R.union, []);
export const mergeObjects = R.reduce(R.mergeDeepRight, {});

export const getTopicSouls = params => {
  const { topics = ["all"] } = params || {};
  const days = R.propOr(90, "days", params) || 90;
  const dayStrings = [];
  const oneDay = 1000 * 60 * 60 * 24;
  const start = new Date().getTime() - oneDay * parseInt(days, 10);
  for (let i = 0; i <= days + 1; i++)
    dayStrings.push(getDayStr(start + i * oneDay));
  return Object.keys(
    topics.reduce(
      (result, topicName) =>
        dayStrings.reduce((res, ds) => {
          res[`${PREFIX}/topics/${topicName}/days/${ds}`] = true;
          return res;
        }, result),
      {}
    )
  );
};

const thingVoteCount = voteType =>
  query((scope, thingSoul) =>
    scope
      .get(thingSoul)
      .get(voteType)
      .count()
  );

export const thingVotesUp = thingVoteCount("votesup");
export const thingVotesDown = thingVoteCount("votesdown");
export const thingAllCommentsCount = query((scope, thingSoul) =>
  scope.get(`${thingSoul}/allcomments`).count()
);

export const thing = query((scope, thingSoul) =>
  scope.get(thingSoul).then(meta => {
    if (!meta || !meta.id) return null;
    const result = { id: meta.id, timestamp: parseFloat(meta.timestamp, 10) };
    const replyToSoul = R.path(["replyTo", "#"], meta);
    const opSoul = R.path(["op", "#"], meta);
    const opId = opSoul ? routes.Thing.match(opSoul).thingid : null;
    const replyToId = replyToSoul
      ? routes.Thing.match(replyToSoul).thingid
      : null;
    if (opId) result.opId = opId;
    if (replyToId) result.replyToId = replyToId;
    return result;
  })
);

export const thingScores = query((scope, thingSoul) =>
  all([
    thingVotesUp(scope, thingSoul),
    thingVotesDown(scope, thingSoul),
    thingAllCommentsCount(scope, thingSoul)
  ]).then(([up, down, comment]) => ({ up, down, comment, score: up - down }))
);

export const thingMeta = query(
  (scope, { thingSoul, tabulator, data = false, scores = false }) =>
    all([
      thing(scope, thingSoul),
      scores
        ? tabulator
          ? scope.get(`${thingSoul}/votecounts@${tabulator}.`).then() // eslint-disable-line
          : thingScores(scope, thingSoul).then()
        : resolve(),
      data
        ? scope
            .get(thingSoul)
            .get("data")
            .then()
        : resolve()
    ]).then(([meta, votes, data]) => {
      if (!meta || !meta.id) return null;
      return { ...meta, votes, data };
    })
);

export const multiThingMeta = query((scope, params) =>
  all(
    R.reduce(
      (promises, thingSoul) => {
        if (!thingSoul) return promises;
        promises.push(thingMeta(scope, { ...params, thingSoul }));
        return promises;
      },
      [],
      R.propOr([], "thingSouls", params)
    )
  )
);

export const singleThingData = query((scope, { thingId }) =>
  scope
    .get(routes.Thing.reverse({ thingId }))
    .get("data")
    .then(data => {
      const { _, ...actual } = data || {}; // eslint-disable-line no-unused-vars
      return { [thingId]: data ? actual : data };
    })
);

export const listingIds = query(
  (scope, soul) =>
    scope.get(soul).then(
      R.compose(
        R.filter(R.identity),
        R.split("+"),
        R.propOr("", "ids")
      )
    ),
  "listingIds"
);

export const singleListing = query((scope, { listing, sort, indexer }) =>
  listingIds(scope, `${PREFIX}${listing}/${sort}@~${indexer}.`).then(
    R.map(thingId => routes.Thing.reverse({ thingId }))
  )
);

export const singleAuthor = query((scope, params) =>
  all([
    params.type && params.type !== "submitted" && params.type !== "overview"
      ? resolve([])
      : scope
          .get(params.authorId)
          .get("submissions")
          .souls(),
    params.type &&
    params.type !== "comments" &&
    params.type !== "overview" &&
    params.type !== "commands"
      ? resolve([])
      : scope
          .get(params.authorId)
          .get("comments")
          .souls()
  ]).then(([submissions, comments]) => unionArrays([submissions, comments]))
);

export const repliesToAuthor = query(
  (scope, { repliesToAuthorId, ...params }) =>
    singleAuthor(scope, { ...params, authorId: repliesToAuthorId }).then(
      authoredSouls =>
        all(
          authoredSouls.map(authoredSoul =>
            scope.get(`${authoredSoul}/comments`).souls()
          )
        ).then(unionArrays)
    )
);

export const singleDomain = query((scope, { domain }) =>
  scope.get(routes.Domain.reverse({ domainName: domain })).souls()
);

export const singleUrl = query((scope, { url }) =>
  scope.get(routes.URL.reverse({ url })).souls()
);

export const singleTopic = query((scope, params) => {
  const topicSouls = getTopicSouls({ ...params, topics: [params.topic] });
  let souls = [];
  let itemMax = LISTING_SIZE;

  if (params.sort === "new") {
    itemMax = LISTING_SIZE;
  } else {
    if (params.sort === "top") itemMax = itemMax * 3;
    if (params.topic === "all") itemMax = itemMax * 3;
  }

  const fetchMore = () => {
    const topicSoul = topicSouls.pop();
    if (souls.length > itemMax || !topicSoul) return resolve(souls);
    return scope
      .get(topicSoul)
      .souls()
      .then(more => {
        souls = [...souls, ...more];
        return fetchMore();
      });
  };

  return fetchMore();
});

export const singleSubmission = query((scope, params) =>
  scope
    .get(routes.ThingAllComments.reverse({ thingId: params.submissionId }))
    .souls(R.prepend(routes.Thing.reverse({ thingId: params.submissionId })))
);

const multiQuery = (singleQuery, plural, single, collate = unionArrays) =>
  query((scope, params) => {
    const items = R.prop(plural, params);
    if (R.isNil(items)) return emptyPromise;
    return all(
      R.map(
        val => singleQuery(scope, { ...params, [single]: val }),
        R.propOr([], plural, params)
      )
    ).then(collate);
  });

export const multiThingData = multiQuery(
  singleThingData,
  "thingIds",
  "thingId",
  mergeObjects
);
export const multiAuthor = multiQuery(singleAuthor, "authorIds", "authorId");
export const multiDomain = multiQuery(singleDomain, "domains", "domain");
export const multiUrl = multiQuery(singleUrl, "urls", "url");
export const multiTopic = multiQuery(singleTopic, "topics", "topic");
export const multiListing = multiQuery(singleListing, "listings", "listing");
export const multiSubmission = multiQuery(
  singleSubmission,
  "submissionIds",
  "submissionId"
);

const voteSort = fn => {
  const resultFn = (scope, params) =>
    multiThingMeta(scope, { ...params, scores: true }).then(
      R.compose(
        R.sortBy(fn),
        R.filter(R.identity)
      )
    );
  const getValueForId = (scope, thingId, params) => thingMeta(scope, {
    ...params,
    scores: true,
    thingSoul: routes.Thing.reverse({ thingId })
  }).then(fn);
  resultFn.getValueForId = getValueForId;
  return resultFn;
};

const timeSort = fn => {
  const resultFn = (scope, params) =>
    multiThingMeta(scope, params).then(
      R.compose(
        R.sortBy(fn),
        R.filter(R.identity)
      )
    );
  const getValueForId = (scope, thingId, params) => thingMeta(scope, {
    ...params,
    thingSoul: routes.Thing.reverse({ thingId })
  }).then(fn);
  resultFn.getValueForId = getValueForId;
  return resultFn;
};

export const sorts = {
  new: timeSort(
    R.compose(
      R.multiply(-1),
      R.prop("timestamp")
    )
  ),
  old: timeSort(R.prop("timestamp")),
  active: voteSort(
    ({ timestamp, lastActive }) => -1 * (lastActive || timestamp)
  ),
  top: voteSort(
    R.compose(
      x => -1 * parseInt(x, 10),
      R.pathOr(0, ["votes", "score"])
    )
  ),
  comments: voteSort(
    R.compose(
      x => -1 * parseFloat(x, 10),
      R.pathOr(0, ["votes", "comment"])
    )
  ),
  discussed: voteSort(thing => {
    const timestamp = R.prop("timestamp", thing);
    const score = parseInt(R.pathOr(0, ["votes", "comment"], thing), 10);
    const seconds = timestamp / 1000 - 1134028003;
    const order = Math.log10(Math.max(Math.abs(score), 1));
    if (!score) return 1000000000 - seconds;
    return -1 * (order + seconds / 45000);
  }),
  hot: voteSort(thing => {
    const timestamp = R.prop("timestamp", thing);
    const score = parseInt(R.pathOr(0, ["votes", "score"], thing), 10);
    const seconds = timestamp / 1000 - 1134028003;
    const order = Math.log10(Math.max(Math.abs(score), 1));
    let sign = 0;
    if (score > 0) {
      sign = 1;
    } else if (score < 0) {
      sign = -1;
    }
    return -1 * (sign * order + seconds / 45000);
  }),
  best: voteSort(thing => {
    const ups = parseInt(R.pathOr(0, ["votes", "up"], thing), 10);
    const downs = parseInt(R.pathOr(0, ["votes", "down"], thing), 10);
    const n = ups + downs;
    if (n === 0) return 0;
    const z = 1.281551565545; // 80% confidence
    const p = ups / n;
    const left = p + (1 / (2 * n)) * z * z;
    const right = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
    const under = 1 + (1 / n) * z * z;
    return -1 * ((left - right) / under);
  }),
  controversial: voteSort(thing => {
    const ups = parseInt(R.pathOr(0, ["votes", "up"], thing), 10);
    const downs = parseInt(R.pathOr(0, ["votes", "down"], thing), 10);
    if (ups <= 0 || downs <= 0) return 0;
    const magnitude = ups + downs;
    const balance = ups > downs ? downs / ups : ups / downs;
    return -1 * magnitude ** balance;
  })
};

export const sortThings = (scope, params) =>
  (sorts[params.sort] || sorts.new)(scope, params);

export const filterThings = (scope, things, fn) =>
  all(
    R.map(thing => {
      if (!thing || !thing.id) return resolve();
      return scope
        .get(routes.Thing.reverse({ thingId: thing.id }))
        .get("data")
        .then(R.assoc("data", R.__, thing))
        .then(thingWithData => {
          const thingId = R.path(["data", "opId"], thingWithData);
          if (!thingId) return thingWithData;
          return scope
            .get(routes.Thing.reverse({ thingId }))
            .get("data")
            .then(R.assoc("opData", R.__, thingWithData));
        });
    }, things)
  ).then(R.filter(R.allPass([R.identity, fn])));
