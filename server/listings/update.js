/* globals Promise */
import * as R from "ramda";
import { getRow } from "../notabug-peer/source";
import { routes } from "../notabug-peer/json-schema";
import { needsScores, needsData } from "./datasources";
import { sorts, thingMeta } from "../queries";

const [POS_IDX, POS_ID, POS_VAL] = [0, 1, 2, 3]; // eslint-disable-line no-unused-vars
const sortByVal = R.sortWith(
  [
    R.ascend(
      R.compose(
        val => (val === null ? Infinity : val),
        row => row[POS_VAL]
      )
    )
  ]
);

export const updateListing = (
  node,
  updatedItems = [],
  removeIds = [],
  maxSize = 1000
) => {
  const byId = {};
  const changes = {};
  const byIdx = [];
  const rows = [];
  const removed = R.reduce(
    (res, id) => {
      res[id] = true;
      return res;
    },
    {},
    removeIds
  );
  const updated = {};

  R.keys(node).forEach(key => {
    const parsed = parseInt(key);
    if (!(parsed || parsed === 0)) return;
    const row = getRow(node, key) || [parsed, null, null];
    const [idx, id = null, rawValue = null] = row;
    row[POS_VAL] = rawValue === null ? null : parseFloat(rawValue);
    if (id && removed[id]) row[POS_ID] = row[POS_VAL] = null;
    byIdx[idx] = row;
    if (id) byId[id] = row;
    rows.push(row);
  });

  const existingRows = rows.slice();

  for (let i = 0; i < updatedItems.length; i++) {
    const [id, value] = updatedItems[i] || [null, null];

    if (!id) continue;
    const existing = byId[id];

    if (existing) {
      if (existing[POS_VAL] !== value) {
        existing[POS_VAL] = value;
        updated[id] = true;
        changes[`${existing[POS_IDX]}`] = [id, value].join(",");
      }
    } else {
      const row = [null, id, value];
      rows.push(row);
    }
  }

  const allSorted = sortByVal(rows);
  const sorted = maxSize ? allSorted.slice(0, maxSize) : allSorted;
  const missing = maxSize ? allSorted.slice(maxSize, allSorted.length) : [];
  const added = R.filter(row => row[POS_IDX] === null, sorted);
  const toReplace = R.filter(row => row[POS_IDX] !== null, missing);

  for (let i = 0; i < sorted.length; i++) {
    const id = sorted[i][POS_ID];
    const idx = sorted[i][POS_IDX];

    if (id) {
      const val = sorted[i][POS_VAL];
      if (idx !== null && updated[id]) changes[`${idx}`] = [id, val].join(",");
    } else {
      if (idx === null) continue;
      toReplace.push(sorted[i]);
    }
  }

  const inserted = [];

  const thingsAdded = [];
  const thingsReplaced = [];

  while (added.length) {
    const row = added.pop();
    const replaced = toReplace.pop();
    let [idx] = replaced || [null];

    if (idx === null) {
      idx = existingRows.length + inserted.length;
      inserted.push(idx);
    }

    changes[`${idx}`] = [row[POS_ID], row[POS_VAL]].join(",");
    thingsAdded.push(row);
    if (replaced) thingsReplaced.push(replaced);
  }

  while (toReplace.length) {
    const row = toReplace.pop();
    if (row) {
      const idx = `${row[POS_IDX]}`;
      if (changes[idx] !== null) changes[idx] = null;
    }
  }

  return R.keys(changes).length ? changes : null;
};

export const updateThings = async (
  orc,
  route,
  scope,
  sort,
  ids = [],
  removedIds = [],
  isSticky = R.always(false),
  def = null
) => {
  if (!ids.length && !removedIds.length) return;
  const tabulator = `~${orc.pub}`;

  const node = await orc.newScope().get(route.soul);

  const updatedItems = R.filter(
    R.identity,
    await Promise.all(
      R.map(async thingId => {
        if (isSticky(thingId)) return [thingId, -Infinity];
        if (!def) {
          return [
            thingId,
            await sorts[sort].getValueForId(scope, thingId, { tabulator })
          ];
        }

        return thingMeta(scope, {
          thingSoul: routes.Thing.reverse({ thingId }),
          tabulator,
          scores: needsScores(def),
          data: needsData(def)
        }).then(async item => {
          if (def.thingFilter(item)) {
            return [
              thingId,
              await sorts[sort].getValueForId(scope, thingId, { tabulator })
            ];
          }
          removedIds.push(thingId);
          return null;
        });
      }, ids)
    )
  );
  const changes = updateListing(node, updatedItems, removedIds);
  if (changes) console.log("CHANGES", route.soul, changes);
  if (changes) route.write(changes);
};
