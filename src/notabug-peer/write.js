import { curry } from "ramda";
import { ZalgoPromise as Promise } from "zalgo-promise";
import objHash from "object-hash";
import urllite from "urllite";
import { getDayStr } from "./util";

export const putThing = curry((peer, data) => {
  data.timestamp = data.timestamp || (new Date()).getTime(); // eslint-disable-line
  const id = objHash(data, { unorderedSets: true });
  const node = peer.souls.thing.get({ thingid: id });
  const dataNode = peer.souls.thingData.get({ thingid: id });
  dataNode.put(data);
  node.get("data").put(dataNode);
  node.put({ id, timestamp: data.timestamp });
  peer.souls.things.get().set(node);
  peer.indexThing(id, data);
  return node;
});

export const getStuff = curry((peer, path) => {
  const user = peer.isLoggedIn();
  if (!user) throw new Error("Login required");
  const soul = `${path}${user.pub}`;
  return peer.gun.get(soul);
});

export const putStuff = curry((peer, path, data) => {
  const node = peer.getStuff(path);
  node.put(data);
  return node;
});

export const submit = curry((peer, data) => {
  const timestamp = data.timestamp || (new Date()).getTime();
  const user = peer.isLoggedIn();

  if (data.topic) data.topic = data.topic.toLowerCase().trim(); // eslint-disable-line
  if (data.domain) data.domain = data.domain.toLowerCase().trim(); // eslint-disable-line
  if (user) {
    data.author = user.alias; // eslint-disable-line
    data.authorId = user.pub; // eslint-disable-line
  }

  const thing = peer.putThing({ ...data, timestamp, kind: "submission" });

  if (user) {
    peer.gun.user().get("things").set(thing);
    peer.gun.user().get("submissions").set(thing);
  }

  return new Promise(resolve => {
    thing.on(result => {
      if (!result) return;
      thing.off();
      resolve(result);
    });
  });
});

export const comment = curry((peer, data) => {
  const user = peer.isLoggedIn();

  if (data.topic) data.topic = data.topic.toLowerCase().trim(); // eslint-disable-line
  if (user) {
    data.author = user.alias; // eslint-disable-line
    data.authorId = user.pub; // eslint-disable-line
  }

  const thing = peer.putThing({ ...data, kind: "comment" });

  if (user) {
    peer.gun.user().get("things").set(thing);
    peer.gun.user().get("comments").set(thing);
  }

  return thing;
});

export const chat = curry((peer, data) => {
  const user = peer.isLoggedIn();
  if (data.topic) data.topic = data.topic.toLowerCase().trim(); // eslint-disable-line
  if (user) {
    data.author = user.alias; // eslint-disable-line
    data.authorId = user.pub; // eslint-disable-line
  }

  const thing = peer.putThing({ ...data, kind: "chatmsg" });

  if (user) peer.gun.user().get("things").set(thing);
  return thing;
});

export const vote = curry((peer, id, kind, nonce) => {
  const thing = peer.souls.thing.get({ thingid: id });
  const votes = peer.souls.thingVotes.get({ thingid: id, votekind: kind });
  thing.get(`votes${kind}`).put(votes);
  return votes.set(nonce);
});

const topicPrefixes = {
  chatmsg: "chat:",
  comment: "comments:",
};

export const indexThing = curry((peer, thingid, data) => {
  if (!data.topic && !data.opId) return;

  if (data.opId && !data.topic) {
    peer.souls.thingData.get({ thingid: data.opId })
      .on(function recv(td) {
        if (!td) return;
        peer.indexThing(thingid, { ...data, topic: td.topic || "all" });
        this.off();
      });
    return;
  }

  const thing = peer.souls.thing.get({ thingid });
  const dayStr = getDayStr(data.timestamp);
  const [year, month, day] = dayStr.split("/");
  const topicPrefix = topicPrefixes[data.kind] || "";
  const topicname = topicPrefix + data.topic.toLowerCase().trim();
  const topic = peer.souls.topic.get({ topicname });
  const topicDay = peer.souls.topicDay.get({ topicname, year, month, day });

  if (!data.skipAll && data.topic !== "all") {
    const allname = `${topicPrefix}all`;
    const allTopic = peer.souls.topic.get({ topicname: allname });
    const allTopicDay = peer.souls.topicDay.get({ topicname: allname, year, month, day });
    allTopic.set(thing);
    allTopicDay.set(thing);
  }

  if (data.kind === "submission") {
    const urlInfo = data.url ? urllite(data.url) : {};
    const domainName = (data.url ? (urlInfo.host || "").replace(/^www\./, "") : `self.${data.topic}`).toLowerCase();
    const domain = peer.souls.domain.get({ domain: domainName });
    domain.set(thing);

    if (data.url) {
      const urlNode = peer.souls.url.get({ url: data.url });
      thing.get("url").put(urlNode);
      urlNode.set(thing);
    }
  }

  if (data.opId) {
    const op = peer.souls.thing.get({ thingid: data.opId });
    const allcomments = peer.souls.thingAllComments.get({ thingid: data.opId });
    thing.get("op").put(op);
    op.get("allcomments").put(allcomments);
    allcomments.set(thing);
  }

  if (data.replyToId || data.opId) {
    const replyTo = peer.souls.thing.get({ thingid: data.replyToId || data.opId });
    const comments = peer.souls.thingComments.get({ thingid: data.replyToId || data.opId });
    comments.set(thing);
    thing.get("replyTo").put(replyTo);
    replyTo.get("comments").put(comments);
  }

  thing.get("votesup").once(() => null);
  thing.get("votesdown").once(() => null);
  thing.get("allcomments").once(() => null);
  thing.get("comments").once(() => null);
  topic.set(thing);
  topicDay.set(thing);
  thing.get("topic").set(topic);
});

export const saveThingInLens = curry((peer, thingid, category="saved") => {
  if (peer.isLoggedIn()) throw new Error("Login required");
  if (!category) throw new Error("Category required");
  const lensname = category.toLowerCase();
  const gunUser = peer.gun.user();
  const thing = peer.souls.thing.get({ thingid });
  const lenses = peer.getStuff(peer.souls.lenses.soul());
  const lens = peer.getStuff(peer.souls.lens.soul({ lensname }));
  const lensThings = peer.getStuff(peer.souls.lensThings.soul({ lensname }));
  lensThings.set(thing);
  lens.get("things").put(lensThings);
  lenses.get(category).put(lens);
  gunUser.get("lenses").put(lenses);
  return lens;
});

export const unsaveThingInLens = curry((peer, thingid, category="saved") => {
  if (peer.isLoggedIn()) throw new Error("Login required");
  if (!category) throw new Error("Category required");
  const lensname = category.toLowerCase();
  const lensThings = peer.getStuff(peer.souls.lensThings.soul({ lensname }));
  const thingSoul = peer.souls.thing.get({ thingid });
  return lensThings.get(thingSoul).put(null);
});
