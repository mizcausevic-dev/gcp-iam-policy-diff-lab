// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { driftPackets, policyLanePackets, samplePolicyDiffPayload } from "../data/samplePolicyDiff.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-30T00:00:00Z";
const report = analyze(samplePolicyDiffPayload, {
  now: NOW,
  staleDiffAfterHours: 24
});

function severityRank(finding: Finding): number {
  return finding.severity === "high"
    ? 0
    : finding.severity === "medium"
      ? 1
      : finding.severity === "low"
        ? 2
        : 3;
}

export function summary() {
  return {
    snapshots: report.snapshots,
    currentSnapshots: report.currentSnapshots,
    diffs: report.diffs,
    publicBindings: report.publicBindings,
    privilegedBindings: report.privilegedBindings,
    orgPolicyDrifts: report.orgPolicyDrifts,
    highFindings: report.findingsList.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Clear public bindings, remove basic roles, revalidate token creator grants, and refresh stale snapshots before calling GCP IAM posture healthy."
  };
}

export function policyLane() {
  return policyLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findingsList.filter((finding) => {
      if (lane.id === "public-surface") {
        return finding.code === "viewer-to-allusers";
      }
      if (lane.id === "basic-role-lane") {
        return finding.code === "editor-basic-role-grant";
      }
      if (lane.id === "token-creator-lane") {
        return finding.code === "service-account-token-creator";
      }
      if (lane.id === "snapshot-hygiene") {
        return finding.code === "stale-snapshot" || finding.code === "folder-inheritance-drift" || finding.code === "stale-diff-window";
      }
      return false;
    }).length
  }));
}

export function bindingRisks() {
  return [...report.findingsList]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "viewer-to-allusers"
          ? "Cloud Security Engineering"
          : finding.code === "editor-basic-role-grant"
            ? "Platform IAM"
            : finding.code === "service-account-token-creator"
              ? "Identity Platform"
              : "Cloud Governance"
    }));
}

export function driftPosture() {
  return driftPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline diff analyzer and CLI, not static copy alone.",
    "Snapshots and binding diffs are synthetic sample data only; no live Google Cloud credentials, project IDs, or tenant secrets are published.",
    "The control plane keeps public bindings, privileged roles, org-policy drift, and snapshot freshness visible for GCP platform and security stakeholders.",
    "This surface demonstrates GCP IAM policy diff and guardrail operations, not a generic cloud keyword project.",
    "It complements Azure/Microsoft and AWS admin proof with a concrete Google Cloud IAM drift lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    policyLane: policyLane(),
    bindingRisks: bindingRisks(),
    driftPosture: driftPosture(),
    verification: verification(),
    sample: samplePolicyDiffPayload
  };
}
