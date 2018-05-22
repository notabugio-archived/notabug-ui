import { identity, assoc, assocPath, pathOr, sortBy, compose } from "ramda";
import debounce from "lodash/debounce";
import { PREFIX } from "./etc";
import moment from "moment";
import isNode from "detect-node";
import qs from "qs";

let DEF_DAYS;

if (isNode) {
  DEF_DAYS = 3;
} else {
  DEF_DAYS = parseInt(qs.parse(window.location.search.slice(1)).days, 10) || 3;
}

export const recentRange = () => {
  const days = DEF_DAYS;
  const start = moment().utc().subtract(days, "days");
  const result = [];
  for (var i = 0; i <= (days + 1); i++) {
    result.push(moment(start).add(i, "days").utc().format("YYYY/M/D"));
  }
  return result;
};

export const listing = (getChains, { threshold=-Infinity }, myContent={}) => {
  let timestamps = {};
  let votes = {};
  let subscribers = {};
  let scoreThreshold = threshold;

  const isMine = id => !!myContent[id];
  const on = (cb, id=null, db=100) => subscribers[id] = debounce(cb, db, { leading: true, trailing: true });
  const off = (id=null) => delete subscribers[id];
  const close = () => getChains().map(gunChain => gunChain.off()); // TODO: not sure this is enough?
  const getThing = (id) => getChains()[0].back(-1).get(`${PREFIX}/things/${id}/data`);
  const getVoteCount = (id, type="up") => pathOr(0, [id, type], votes);
  const storeTimestamp = id => timestamp => timestamps = assoc(id, timestamp, timestamps);

  const countVote = (id, kind, notify) => () => {
    votes = assocPath([id, kind], pathOr(0, [id, kind], votes) + 1, votes);
    if (notify) notify();
  };

  const ids = (sort="hot", { threshold=threshold }, mine=myContent) => {
    myContent = mine;
    scoreThreshold = threshold;
    return compose(
      sorts[sort] || sorts["hot"],
      sort === "new"
        ? identity
        : x => x.filter(id => (
          isMine(id) ||
          (getVoteCount(id, "up") - getVoteCount(id, "down")) >= scoreThreshold)
        ),
      Object.keys
    )(timestamps);
  };

  const sorts = {
    new: sortBy((id) => -1 * pathOr(0, [id], timestamps)),

    top: sortBy((id) => {
      if (isMine(id)) return -Infinity;
      const ups = getVoteCount(id, "up");
      const downs = getVoteCount(id, "down");
      return downs - ups;
    }),

    best: sortBy((id) => {
      if (isMine(id)) return -Infinity;
      const ups = getVoteCount(id, "up");
      const downs = getVoteCount(id, "down");
      const n = ups + downs;
      if (n === 0) return 0;
      const z = 1.281551565545; // 80% confidence
      const p = ups / n;
      const left = p + 1/(2*n)*z*z;
      const right = z*Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
      const under = 1+1/n*z*z;
      return -1 * ((left - right) / under);
    }),

    controversial: sortBy((id) => {
      if (isMine(id)) return -Infinity;
      const ups = getVoteCount(id, "up");
      const downs = getVoteCount(id, "down");
      if (ups <= 0 || downs <= 0) return 0;
      const magnitude = ups + downs;
      const balance = (ups > downs)
        ? downs / ups
        : ups /downs;
      return -1 * (magnitude ** balance);
    }),

    hot: sortBy((id) => {
      if (isMine(id)) return -Infinity;
      const ups = pathOr(0, [id, "up"], votes);
      const downs = pathOr(0, [id, "down"], votes);
      const timestamp = pathOr(0, [id], timestamps);
      const score = ups - downs;
      const seconds = (timestamp/1000) - 1134028003;
      const order = Math.log10(Math.max(Math.abs(score), 1));
      let sign = 0;
      if (score > 0) { sign = 1; } else if (score < 0) { sign = -1; }
      return -1 * (sign * order + seconds / 45000);
    })
  };

  getChains().forEach(gunChain => gunChain.map().once(function ({ id, timestamp }) {
    const thing = this;
    const notifyUpdate = () => {
      subscribers[id] && subscribers[id](id);
      subscribers[null] && subscribers[null](id);
    };
    storeTimestamp(id)(timestamp);
    notifyUpdate(id);
    thing.get("votesup").map().once(countVote(id, "up", notifyUpdate));
    thing.get("votesdown").map().once(countVote(id, "down", notifyUpdate));
    thing.get("allcomments").map().get("id").once(countVote(id, "comment", notifyUpdate));
  }));

  return { ids, getVoteCount, getThing, close, on, off };
};
