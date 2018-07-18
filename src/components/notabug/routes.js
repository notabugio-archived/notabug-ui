import React from "react";
import { Topic } from "./Topic";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionDetail } from "./SubmissionDetail";
import { ContentPolicy } from "../ContentPolicy";
import { PrivacyPolicy } from "../PrivacyPolicy";
import { UserAgreement } from "../UserAgreement";
import { KnownPeers } from "../KnownPeers";

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
    component: SubmissionDetail
  }, {
    path: "/t/:topic/comments/:submission_id",
    component: SubmissionDetail
  }, {
    path: "/t/:topic/submit",
    component: SubmissionForm
  }, {
    path: "/t/:topic/index.html",
    component: SubmissionForm
  }, {
    path: "/t/:topic/:sort/index.html",
    component: Topic
  }, {
    path: "/t/:topic/:sort",
    component: Topic
  }, {
    path: "/t/:topic",
    component: Topic
  }, {
    path: "/domain/:domain/:sort/index.html",
    component: Topic
  }, {
    path: "/domain/:domain/index.html",
    component: Topic
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
    path: "/:sort/index.html",
    component: Topic
  }, {
    path: "/:sort",
    component: Topic
  }, {
    path: "/",
    exact: true,
    component: Topic
  }
];
