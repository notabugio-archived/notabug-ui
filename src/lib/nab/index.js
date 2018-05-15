import Gun from "gun";
import { listing } from "./read";
import { submit, comment, vote } from "./write";
import { checkMessage } from "./validate";
import isNode from "detect-node";
import { PREFIX } from "./etc";
export { PREFIX } from "./etc";

if (isNode) {
  // Only server nodes need to validate for now
  Gun.on("opt", function(context) {
    context.on("in", function(msg) {
      const to = this.to;
      if (checkMessage(msg)) {
        to.next(msg);
      } else {
        console.warn("rejected message", msg);
      }
    });
  });
}

export const init = () => {
  const gun = Gun(window.location.origin + "/gun");
  const bound = fn => (...args) => fn(gun, ...args);

  return {
    gun,
    listing,
    submit: bound(submit),
    comment: bound(comment),
    vote: bound(vote),
    getSubmissions: (topic="all") => gun.get(`${PREFIX}/topics/${topic}`),
    getSubmissionsByDomain: (domain) => gun.get(`${PREFIX}/domains/${domain}`),
    getComments: (id) => gun.get(`${PREFIX}/things/${id}/comments`)
  };
};
