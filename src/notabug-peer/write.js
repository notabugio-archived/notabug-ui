import { curry } from "ramda";
import { ZalgoPromise as Promise } from "zalgo-promise";
import objHash from "object-hash";
import urllite from "urllite";
import { getDayStr } from "./util";

export const putThing = curry((peer, data) => {
  data.timestamp = data.timestamp || new Date().getTime(); // eslint-disable-line
  const originalHash = objHash(data);
  const { timestamp, kind, topic, authorId, opId, replyToId } = data;
  const thingid = objHash({
    timestamp,
    kind,
    topic,
    authorId,
    opId,
    replyToId,
    originalHash
  });

  const node = peer.souls.thing.get({ thingid });

  const dataSoul = authorId
    ? peer.souls.thingDataSigned.soul({ thingid, authorId })
    : peer.souls.thingData.soul({ thingid: originalHash });

  const metaData = {
    id: thingid,
    timestamp,
    kind,
    originalHash,
    data: { "#": dataSoul },
    votesup: { "#": peer.souls.thingVotes.soul({ thingid, votekind: "up" }) },
    votesdown: {
      "#": peer.souls.thingVotes.soul({ thingid, votekind: "down" })
    },
    allcomments: { "#": peer.souls.thingAllComments.soul({ thingid }) },
    comments: { "#": peer.souls.thingComments.soul({ thingid }) }
  };

  if (topic)
    metaData.topic = { "#": peer.souls.topic.soul({ topicname: topic }) };
  if (authorId) metaData.author = { "#": `~${authorId}` };
  if (opId) metaData.op = { "#": peer.souls.thing.soul({ thingid: opId }) };
  if (replyToId)
    metaData.replyTo = { "#": peer.souls.thing.soul({ thingid: replyToId }) };

  peer.gun.get(dataSoul).put(data);
  node.put(metaData);
  peer.indexThing(thingid, data);
  return node;
});

export const submit = curry((peer, data) => {
  const timestamp = data.timestamp || new Date().getTime();
  const user = peer.isLoggedIn();

  if (data.topic) data.topic = data.topic.toLowerCase().trim(); // eslint-disable-line
  if (data.domain) data.domain = data.domain.toLowerCase().trim(); // eslint-disable-line
  if (user) {
    data.author = user.alias; // eslint-disable-line
    data.authorId = user.pub; // eslint-disable-line
  }

  const thing = peer.putThing({ ...data, timestamp, kind: "submission" });

  if (user) {
    peer.gun
      .user()
      .get("things")
      .set(thing);
    peer.gun
      .user()
      .get("submissions")
      .set(thing);
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
    peer.gun
      .user()
      .get("things")
      .set(thing);
    peer.gun
      .user()
      .get("comments")
      .set(thing);
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

  if (user)
    peer.gun
      .user()
      .get("things")
      .set(thing);
  return thing;
});

export const writePage = curry((peer, name, body) => {
  const user = peer.isLoggedIn();
  if (!user) return Promise.reject("not logged in");
  let thing;
  const pagesSoul = peer.souls.userPages.soul({ authorId: user.pub });
  const chain = peer.gun
    .get(pagesSoul)
    .get(name);
  return chain.then(res => {
    if (res && res.data) {
      console.log("res", res);
      chain.get("data").get("body").put(body);
    } else {
      const data = {
        body,
        title: name,
        kind: "wikipage",
        author: user.alias,
        authorId: user.pub
      };
      console.log("page data", data);
      thing = peer.putThing(data);
      chain.put(thing);
    }
  });
});

export const vote = curry((peer, id, kind, nonce) => {
  const thing = peer.souls.thing.get({ thingid: id });
  const votes = peer.souls.thingVotes.get({ thingid: id, votekind: kind });
  thing.get(`votes${kind}`).put(votes);
  return votes.get(nonce).put("1");
});

const topicPrefixes = {
  chatmsg: "chat:",
  comment: "comments:"
};

export const indexThing = curry((peer, thingid, data) => {
  if (!data.topic && !data.opId) return;

  if (data.opId && !data.topic) {
    peer.souls.thing
      .get({ thingid: data.opId })
      .get("data")
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
  const basetopicname = data.topic.toLowerCase().trim();
  const topicname = topicPrefix + basetopicname;
  const topic = peer.souls.topic.get({ topicname });
  const topicDay = peer.souls.topicDay.get({ topicname, year, month, day });

  if (!data.skipAll && data.topic !== "all") {
    const allname = `${topicPrefix}all`;
    const allTopic = peer.souls.topic.get({ topicname: allname });
    const allTopicDay = peer.souls.topicDay.get({
      topicname: allname,
      year,
      month,
      day
    });
    allTopic.set(thing);
    allTopicDay.set(thing);
  }

  if (data.kind === "submission") {
    const urlInfo = data.url ? urllite(data.url) : {};
    const domainName = (data.url
      ? (urlInfo.host || "").replace(/^www\./, "")
      : `self.${data.topic}`
    ).toLowerCase();
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
    op.get("allcomments").put(allcomments);
    allcomments.set(thing);
  }

  if (data.replyToId || data.opId) {
    const replyTo = peer.souls.thing.get({
      thingid: data.replyToId || data.opId
    });
    const comments = peer.souls.thingComments.get({
      thingid: data.replyToId || data.opId
    });
    comments.set(thing);
    replyTo.get("comments").put(comments);
  }

  topic.set(thing);
  topicDay.set(thing);
});
