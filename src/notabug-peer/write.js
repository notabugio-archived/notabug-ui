import { curry, path, keysIn } from "ramda";
import { ZalgoPromise as Promise } from "zalgo-promise";
import objHash from "object-hash";
import { parse as parseURI } from "uri-js";
import { getDayStr } from "./constants";
import { routes } from "./json-schema";

export const putThing = curry((peer, data) => {
  data.timestamp = data.timestamp || new Date().getTime(); // eslint-disable-line
  const originalHash = objHash(data);
  const { timestamp, kind, topic, authorId, opId, replyToId } = data;
  const thingId = objHash({
    timestamp,
    kind,
    topic,
    authorId,
    opId,
    replyToId,
    originalHash
  });

  const node = peer.gun.get(routes.Thing.reverse({ thingId }));

  const dataSoul = authorId
    ? routes.ThingDataSigned.reverse({ thingId, authorId })
    : routes.ThingData.reverse({ thingId: originalHash });

  const metaData = {
    id: thingId,
    timestamp,
    kind,
    originalHash,
    data: { "#": dataSoul },
    votesup: { "#": routes.ThingVotesUp.reverse({ thingId }) },
    votesdown: { "#": routes.ThingVotesDown.reverse({ thingId }) },
    allcomments: { "#": routes.ThingAllComments.reverse({ thingId }) },
    comments: { "#": routes.ThingComments.reverse({ thingId }) }
  };

  if (topic)
    metaData.topic = { "#": routes.Topic.reverse({ topicName: topic }) };
  if (authorId) metaData.author = { "#": `~${authorId}` };
  if (opId) metaData.op = { "#": routes.Thing.reverse({ thingId: opId }) };
  if (replyToId)
    metaData.replyTo = { "#": routes.Thing.reverse({ thingId: replyToId }) };

  peer.gun.get(dataSoul).put(data);
  node.put(metaData);
  peer.indexThing(thingId, data);
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
    upgradeSouls(peer)
      .then(() => {
        const thingsSoul = routes.AuthorThings.reverse({ authorId: user.pub });
        const submissionsSoul = routes.AuthorSubmissions.reverse({
          authorId: user.pub
        });
        const things = peer.gun.get(thingsSoul);
        const submissions = peer.gun.get(submissionsSoul);
        peer.gun
          .user()
          .get("things")
          .put(things);
        peer.gun
          .user()
          .get("submissions")
          .put(submissions);
        things.set(thing);
        submissions.set(thing);
      })
      .then(() => thing);
  }

  return thing;
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
    return upgradeSouls(peer)
      .then(() => {
        const thingsSoul = routes.AuthorThings.reverse({ authorId: user.pub });
        const commentsSoul = routes.AuthorComments.reverse({
          authorId: user.pub
        });
        const things = peer.gun.get(thingsSoul);
        const comments = peer.gun.get(commentsSoul);
        peer.gun
          .user()
          .get("things")
          .put(things);
        peer.gun
          .user()
          .get("comments")
          .put(comments);
        things.set(thing);
        comments.set(thing);
      })
      .then(() => thing);
  }

  // peer.gun.user().get("comments").put(peer.gun.user().get("comments"));

  return thing;
});

const upgradeSouls = peer => {
  const user = peer.isLoggedIn();
  if (!user || !user.pub) return Promise.resolve(null);
  const { pub: authorId } = user;

  const userChain = () => peer.gun.user();
  const upgradeThing = (name, schemaRoute) => {
    return userChain().then(user => {
      return userChain()
        .get(name)
        .then(node => {
          const soul = path(["_", "#"], node);
          if (soul && !schemaRoute.match(soul)) {
            const newSoul = schemaRoute.reverse({ authorId });
            peer.gun.get(soul).then(nodeData => {
              const { _, ...data } = nodeData || {};
              keysIn(data).forEach(key => {
                const val = data[key];
                if (val && val[1]) {
                  data[key] = {
                    "#": val[1]
                  };
                }
              });
              console.log("upgrading", soul, "to", newSoul, data);
              const upgradedNode = peer.gun.get(
                schemaRoute.reverse({ authorId })
              );
              upgradedNode.put(data);
              userChain()
                .get(name)
                .put(upgradedNode);
            });
          }
        });
    });
  };

  return Promise.all([
    upgradeThing("things", routes.AuthorThings),
    upgradeThing("comments", routes.AuthorComments),
    upgradeThing("submissions", routes.AuthorSubmissions)
  ]);
};

export const chat = curry((peer, data) => {
  const user = peer.isLoggedIn();
  if (data.topic) data.topic = data.topic.toLowerCase().trim(); // eslint-disable-line
  if (user) {
    data.author = user.alias; // eslint-disable-line
    data.authorId = user.pub; // eslint-disable-line
  }

  const thing = peer.putThing({ ...data, kind: "chatmsg" });

  if (user)
    upgradeSouls(peer).then(() => {
      const thingsSoul = routes.AuthorThings.reverse({ authorId: user.pub });
      const things = peer.gun.get(thingsSoul);
      peer.gun
        .user()
        .get("things")
        .put(things);
      things.set(thing);
    });
  return thing;
});

export const writePage = curry((peer, name, body) => {
  const user = peer.isLoggedIn();
  if (!user) return Promise.reject("not logged in");
  let thing;
  const pagesSoul = routes.AuthorPages.reverse({ authorId: user.pub });
  const chain = peer.gun.get(pagesSoul).get(name);
  return chain.then(res => {
    if (res && res.data) {
      console.log("res", res);
      chain
        .get("data")
        .get("body")
        .put(body);
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
  const votes = peer.gun.get(
    routes[kind === "up" ? "ThingVotesUp" : "ThingVotesDown"].reverse({
      thingId: id
    })
  );
  return votes.get(nonce).put("1");
});

const topicPrefixes = {
  chatmsg: "chat:",
  comment: "comments:"
};

export const indexThing = curry((peer, thingId, data) => {
  if (!data.topic && !data.opId) return;

  if (data.opId && !data.topic) {
    peer.gun
      .get(routes.Thing.reverse({ thingId: data.opId }))
      .get("data")
      .on(function recv(td) {
        if (!td) return;
        peer.indexThing(thingId, { ...data, topic: td.topic || "all" });
        this.off();
      });
    return;
  }

  const thing = peer.gun.get(routes.Thing.reverse({ thingId }));
  const dayStr = getDayStr(data.timestamp);
  const [year, month, day] = dayStr.split("/");
  const topicPrefix = topicPrefixes[data.kind] || "";
  const baseTopicName = data.topic.toLowerCase().trim();
  const topicName = topicPrefix + baseTopicName;
  const topic = peer.gun.get(routes.Topic.reverse({ topicName }));
  const topicDay = peer.gun.get(
    routes.TopicDay.reverse({ topicName, year, month, day })
  );

  if (!data.skipAll && data.topic !== "all") {
    const allname = `${topicPrefix}all`;
    const allTopic = peer.gun.get(routes.Topic.reverse({ topicName: allname }));
    const allTopicDay = peer.gun.get(
      routes.TopicDay.reverse({
        topicName: allname,
        year,
        month,
        day
      })
    );
    allTopic.set(thing);
    allTopicDay.set(thing);
  }

  if (data.kind === "submission") {
    const urlInfo = data.url ? parseURI(data.url) : {};
    const domainName = (data.url
      ? (urlInfo.host || urlInfo.scheme || "").replace(/^www\./, "")
      : `self.${data.topic}`
    ).toLowerCase();
    const domain = peer.gun.get(routes.Domain.reverse({ domainName }));
    domain.set(thing);

    if (data.url) {
      const urlNode = peer.gun.get(routes.URL.reverse({ url: data.url }));
      // thing.get("url").put(urlNode);
      urlNode.set(thing);
    }
  }

  if (data.opId) {
    const allcomments = peer.gun.get(
      routes.ThingAllComments.reverse({ thingId: data.opId })
    );
    allcomments.set(thing);
  }

  if (data.replyToId || data.opId) {
    const comments = peer.gun.get(
      routes.ThingComments.reverse({
        thingId: data.replyToId || data.opId
      })
    );
    comments.set(thing);
  }

  topic.set(thing);
  topicDay.set(thing);
});
