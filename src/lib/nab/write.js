import objHash from "object-hash";
import urllite from "urllite";
import { PREFIX } from "./etc";

const getThing = (gun, id) => gun.get(`${PREFIX}/things/${id}`);

const getTopic = (gun, name) => {
  const topics = gun.get(`${PREFIX}/topics`);
  const topic = gun.get(`${PREFIX}/topics/${name}`);
  topic.put({ name });
  topics.set(topic);
  return topic;
};

const getTopicDay = (gun, name, timestamp) => {
  timestamp = timestamp || (new Date()).getTime();
  const d = new Date(timestamp);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const topicDays = gun.get(`${PREFIX}/topics/${name}/days`);
  const topicDay = gun.get(`${PREFIX}/topics/${name}/days/${year}/${month}/${day}`);
  topicDays.set(topicDay);
  const topic = getTopic(gun, name);
  return { topic, day: topicDay };
};

const putThing = (gun, data=null) => {
  const id = objHash(data, { unorderedSets: true });
  const soul = `${PREFIX}/things/${id}`;
  const dataSoul = `${PREFIX}/things/${id}/data`;
  const node = gun.get(soul);
  const dataNode = gun.get(dataSoul);
  dataNode.put(data);
  node.get("data").put(dataNode);
  node.put({ id, timestamp: data.timestamp });
  gun.get(`${PREFIX}/things`).set(node);
  return node;
};

export const submit = (gun, data) => {
  const timestamp = (new Date()).getTime();
  const { topic, day } = getTopicDay(gun, data.topic, timestamp);
  const { topic: topicAll, day: dayAll } = getTopicDay(gun, "all", timestamp);
  const thing = putThing(gun, { ...data, timestamp, kind: "submission" });
  const urlInfo = data.url ? urllite(data.url) : {};
  const domain = data.url ? (urlInfo.host || "").replace(/^www\./, "") : `self.${data.topic}`;
  const domainNode = gun.get(`${PREFIX}/domains/${domain}`);

  thing.get("topic").put(topic);
  thing.get("domain").put(domainNode);
  topic.set(thing);
  day.set(thing);
  topicAll.set(thing);
  dayAll.set(thing);
  domainNode.set(thing);

  if (data.url) {
    const urlNode = gun.get(`${PREFIX}/urls/${data.url}`);
    thing.get("url").put(urlNode);
    urlNode.set(thing);
    urlNode.get("domain").set(domainNode);
  }

  return thing;
};

export const comment = (gun, data) => {
  const timestamp = (new Date()).getTime();
  const thing = putThing(gun, { ...data, timestamp, kind: "comment" });
  const replyTo = getThing(gun, data.replyToId);
  const op = getThing(gun, data.opId);
  const comments = gun.get(`${PREFIX}/things/${data.replyToId}/comments`);
  const allcomments = gun.get(`${PREFIX}/things/${data.opId}/allcomments`);
  thing.get("replyTo").put(replyTo);
  thing.get("op").put(op);
  replyTo.get("comments").put(comments);
  op.get("allcomments").put(allcomments);
  comments.set(thing);
  allcomments.set(thing);
  return thing;
};

export const vote = (gun, id, kind, nonce) => {
  const thing = getThing(gun, id);
  const votes = gun.get(`${PREFIX}/things/${id}/votes${kind}`);
  thing.get(`votes${kind}`).put(votes);
  return votes.set(nonce);
};
