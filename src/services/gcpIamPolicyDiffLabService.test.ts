import { describe, expect, test } from "vitest";

import {
  bindingRisks,
  driftPosture,
  policyLane,
  summary,
  verification
} from "./gcpIamPolicyDiffLabService.js";

describe("gcpIamPolicyDiffLabService", () => {
  test("summary reflects the sample GCP posture", () => {
    expect(summary()).toMatchObject({
      snapshots: 2,
      currentSnapshots: 1,
      diffs: 4,
      publicBindings: 1,
      privilegedBindings: 2,
      orgPolicyDrifts: 1
    });
  });

  test("policy lane stays mapped to owners", () => {
    const lanes = policyLane();
    expect(lanes).toHaveLength(4);
    expect(lanes.some((lane) => lane.lane === "Public binding lane" && lane.owner === "Cloud Security Engineering")).toBe(true);
  });

  test("binding risks sort high severity first", () => {
    const risks = bindingRisks();
    expect(risks[0]?.severity).toBe("high");
    expect(risks.some((risk) => risk.code === "service-account-token-creator")).toBe(true);
  });

  test("drift posture and verification stay populated", () => {
    expect(driftPosture()).toHaveLength(4);
    expect(verification().length).toBeGreaterThan(3);
  });
});
