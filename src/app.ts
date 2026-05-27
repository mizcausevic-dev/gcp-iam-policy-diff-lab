// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  bindingRisks,
  driftPosture,
  payload,
  policyLane,
  summary,
  verification
} from "./services/gcpIamPolicyDiffLabService.js";
import {
  renderBindingRisks,
  renderDocs,
  renderDriftPosture,
  renderOverview,
  renderPolicyLane,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5515);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/policy-lane", (_req, res) => res.type("html").send(renderPolicyLane()));
app.get("/binding-risks", (_req, res) => res.type("html").send(renderBindingRisks()));
app.get("/drift-posture", (_req, res) => res.type("html").send(renderDriftPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/policy-lane", (_req, res) => res.json(policyLane()));
app.get("/api/binding-risks", (_req, res) => res.json(bindingRisks()));
app.get("/api/drift-posture", (_req, res) => res.json(driftPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`GCP IAM Policy Diff Lab listening on http://${host}:${port}`);
  });
}

export default app;
