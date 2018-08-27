import React from "react";
import { Topic } from "./Topic";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionDetail } from "./SubmissionDetail";
import { ContentPolicy } from "../ContentPolicy";
import { PrivacyPolicy } from "../PrivacyPolicy";
import { UserAgreement } from "../UserAgreement";
import { KnownPeers } from "../KnownPeers";
import { cached } from "./Cached";

const UserProfile = () => (
  <div className="reddit-infobar">
    <h1>User profiles not implemented yet, Sorry!</h1>
    <h4>
      They will be, in classic open-source reddit style with karma counts, and orangereds plus encrypted private messaging.   Be patient, or help out
    </h4>
    <h4>Your current contributions will be on your profile when they are ready</h4>
  </div>
);

const Reddit = ({ location: { pathname, search } }) => (
  <div className="reddit-infobar">
    <h1>This isn't snew</h1>
    <h4>
      {"Yes they share some code, but you're looking for "}
      <a href={`https://snew.github.io${pathname}${search}`}>snew.github.io</a>
    </h4>
    <p>notabug does not rely on reddit's servers, api or content at all; it's its own network.</p>
    <p>Only the open-source UI code from reddit is used.</p>
  </div>
);

export const routes = [
  {
    path: "/help/privacypolicy",
    component: PrivacyPolicy
  }, {
    path: "/help/useragreement",
    component: UserAgreement
  }, {
    path: "/help/contentpolicy",
    component: ContentPolicy
  }, {
    path: "/help/knownpeers",
    component: KnownPeers
  }, {
    path: "/rules",
    component: ContentPolicy
  }, {
    path: "/t/:topic/comments/:submission_id/:slug",
    component: cached(SubmissionDetail)
  }, {
    path: "/t/:topic/comments/:submission_id",
    component: cached(SubmissionDetail)
  }, {
    path: "/t/:topic/submit",
    component: cached(SubmissionForm)
  }, {
    path: "/t/:topic/chat"
  }, {
    path: "/t/:topic/:sort",
    component: cached(Topic)
  }, {
    path: "/t/:topic",
    component: cached(Topic)
  }, {
    path: "/domain/:domain/:sort",
    component: Topic
  }, {
    path: "/domain/:domain",
    component: Topic
  }, {
    path: "/user/:username",
    component: UserProfile
  }, {
    path: "/r/*",
    component: Reddit
  }, {
    path: "/submit",
    component: SubmissionForm
  }, {
    path: "/login",
  }, {
    path: "/chat",
  }, {
    path: "/:sort",
    component: cached(Topic)
  }, {
    path: "/",
    exact: true,
    component: cached(Topic)
  }
];
