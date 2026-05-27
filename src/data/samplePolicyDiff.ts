// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PolicyDiffExport } from "../types.js";

export interface PolicyLanePacket {
  id: string;
  lane: string;
  owner: string;
  focus: string;
  status: "green" | "yellow" | "red";
  nextAction: string;
  note: string;
}

export interface DriftPacket {
  packetId: string;
  lane: string;
  owner: string;
  completenessScore: number;
  status: "red" | "yellow" | "green";
  blocker: string;
  launchWindowHours: number;
  decisionNote: string;
}

export const samplePolicyDiffPayload: PolicyDiffExport = {
  snapshots: [
    {
      id: "snapshot-prod-core",
      name: "prod-core-project",
      scope: "PROJECT",
      resourceType: "Project",
      resourcePath: "projects/prod-core-platform",
      status: "CURRENT",
      bindingCount: 24,
      collectedAt: "2026-05-30T00:00:00Z"
    },
    {
      id: "snapshot-folder-finance",
      name: "finance-folder",
      scope: "FOLDER",
      resourceType: "Bucket",
      resourcePath: "folders/7091448821/buckets/finance-drop-zone",
      status: "STALE",
      bindingCount: 11,
      collectedAt: "2026-05-27T06:00:00Z"
    }
  ],
  diffs: [
    {
      id: "diff-public-viewer",
      snapshotId: "snapshot-prod-core",
      resourcePath: "projects/prod-core-platform/buckets/marketing-atlas-exports",
      resourceType: "Bucket",
      scope: "PROJECT",
      status: "ADDED",
      role: "roles/storage.objectViewer",
      member: "allUsers",
      changeWindowHours: 42,
      isPublic: true,
      note: "Campaign export bucket was opened during an emergency partner handoff."
    },
    {
      id: "diff-editor-basic-role",
      snapshotId: "snapshot-prod-core",
      resourcePath: "projects/prod-core-platform",
      resourceType: "Project",
      scope: "PROJECT",
      status: "CHANGED",
      role: "roles/editor",
      member: "group:ops-contractors@kineticgain.com",
      changeWindowHours: 18,
      isPrivileged: true,
      violatesOrgPolicy: true,
      note: "Basic role reintroduced after a migration rollback."
    },
    {
      id: "diff-token-creator",
      snapshotId: "snapshot-folder-finance",
      resourcePath: "folders/7091448821/serviceAccounts/finance-ingestor@prod-core-platform.iam.gserviceaccount.com",
      resourceType: "ServiceAccount",
      scope: "FOLDER",
      status: "CHANGED",
      role: "roles/iam.serviceAccountTokenCreator",
      member: "serviceAccount:legacy-sync@partner-edge.iam.gserviceaccount.com",
      changeWindowHours: 31,
      isPrivileged: true,
      note: "Legacy partner integration still has token minting rights."
    },
    {
      id: "diff-cleanup-topic",
      snapshotId: "snapshot-prod-core",
      resourcePath: "projects/prod-core-platform/topics/release-audit-events",
      resourceType: "Topic",
      scope: "ORGANIZATION",
      status: "REMOVED",
      role: "roles/pubsub.publisher",
      member: "group:release-audit@kineticgain.com",
      changeWindowHours: 9,
      note: "Removal is expected but still waiting on policy snapshot refresh."
    }
  ]
};

export const policyLanePackets: PolicyLanePacket[] = [
  {
    id: "public-surface",
    lane: "Public binding lane",
    owner: "Cloud Security Engineering",
    focus: "Anonymous and broad viewer bindings",
    status: "red",
    nextAction: "Remove public viewer grants before calling storage posture governed.",
    note: "Public GCS bucket bindings are still the fastest way to turn a policy diff into a real incident."
  },
  {
    id: "basic-role-lane",
    lane: "Basic role lane",
    owner: "Platform IAM",
    focus: "Project-level editor role cleanup",
    status: "red",
    nextAction: "Replace basic roles with scoped custom or product-aligned roles.",
    note: "Editor drift usually means emergency changes that never got normalized."
  },
  {
    id: "token-creator-lane",
    lane: "Service account trust lane",
    owner: "Identity Platform",
    focus: "Cross-environment token creation and workload identity hygiene",
    status: "yellow",
    nextAction: "Revalidate token creator grants before the next partner sync window.",
    note: "Token creator drift should stay visible before it compounds into federation risk."
  },
  {
    id: "snapshot-hygiene",
    lane: "Snapshot hygiene lane",
    owner: "Cloud Governance",
    focus: "Stale snapshots and inheritance drift",
    status: "yellow",
    nextAction: "Refresh folder and org snapshots so policy diffs map to the current baseline.",
    note: "Drift logic is only trustworthy when the baseline is current."
  }
];

export const driftPackets: DriftPacket[] = [
  {
    packetId: "GCP-12",
    lane: "Public GCS exposure",
    owner: "Cloud Security Engineering",
    completenessScore: 48,
    status: "red",
    blocker: "allUsers still has viewer access on a production export bucket",
    launchWindowHours: 6,
    decisionNote: "Do not claim storage governance is clean while anonymous access remains active."
  },
  {
    packetId: "GCP-21",
    lane: "Project basic roles",
    owner: "Platform IAM",
    completenessScore: 57,
    status: "red",
    blocker: "roles/editor drift is still present on the project root",
    launchWindowHours: 12,
    decisionNote: "Collapse basic roles into scoped IAM before the next release approval cycle."
  },
  {
    packetId: "GCP-28",
    lane: "Token creator review",
    owner: "Identity Platform",
    completenessScore: 69,
    status: "yellow",
    blocker: "Legacy partner service account still has token creator rights",
    launchWindowHours: 14,
    decisionNote: "This may be expected, but it needs a clean ownership and expiry narrative."
  },
  {
    packetId: "GCP-35",
    lane: "Snapshot refresh",
    owner: "Cloud Governance",
    completenessScore: 74,
    status: "yellow",
    blocker: "Folder-level snapshot is stale, weakening inheritance confidence",
    launchWindowHours: 24,
    decisionNote: "Refresh snapshots before treating drift deltas as final operator truth."
  }
];
