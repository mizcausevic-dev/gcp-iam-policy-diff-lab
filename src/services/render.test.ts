import { describe, expect, test } from "vitest";

import {
  renderBindingRisks,
  renderDocs,
  renderDriftPosture,
  renderOverview,
  renderPolicyLane,
  renderVerification
} from "./render.js";

describe("render", () => {
  test("overview carries the GCP control-plane framing", () => {
    expect(renderOverview()).toContain("GCP IAM bindings, org-policy drift");
  });

  test("secondary routes render their headings", () => {
    expect(renderPolicyLane()).toContain("Policy Lane");
    expect(renderBindingRisks()).toContain("Binding Risks");
    expect(renderDriftPosture()).toContain("Drift Posture");
    expect(renderVerification()).toContain("Verification");
    expect(renderDocs()).toContain("Offline policy diff analysis");
  });
});
