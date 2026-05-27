import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  bindingRisks,
  driftPosture,
  payload,
  policyLane,
  summary,
  verification
} from "../src/services/gcpIamPolicyDiffLabService.js";
import {
  renderBindingRisks,
  renderDocs,
  renderDriftPosture,
  renderOverview,
  renderPolicyLane,
  renderVerification
} from "../src/services/render.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "site");

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, "api", "dashboard"), { recursive: true });
fs.copyFileSync(path.join(root, "CNAME"), path.join(outputDir, "CNAME"));

const pages: Record<string, string> = {
  "index.html": renderOverview(),
  [path.join("policy-lane", "index.html")]: renderPolicyLane(),
  [path.join("binding-risks", "index.html")]: renderBindingRisks(),
  [path.join("drift-posture", "index.html")]: renderDriftPosture(),
  [path.join("verification", "index.html")]: renderVerification(),
  [path.join("docs", "index.html")]: renderDocs()
};

for (const [relativePath, html] of Object.entries(pages)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, "utf8");
}

const apiPayloads: Record<string, unknown> = {
  [path.join("api", "dashboard", "summary.json")]: summary(),
  [path.join("api", "policy-lane.json")]: policyLane(),
  [path.join("api", "binding-risks.json")]: bindingRisks(),
  [path.join("api", "drift-posture.json")]: driftPosture(),
  [path.join("api", "verification.json")]: verification(),
  [path.join("api", "sample.json")]: payload()
};

for (const [relativePath, data] of Object.entries(apiPayloads)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}
