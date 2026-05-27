// Operator surface for GCP IAM policy snapshots and drift posture.
//
// Inputs reflect exported or captured Google Cloud IAM posture:
//   - resource-level policy snapshots
//   - binding diffs across project, folder, and org layers

export type ScopeKind = "PROJECT" | "FOLDER" | "ORGANIZATION";
export type SnapshotStatus = "CURRENT" | "STALE";
export type DriftStatus = "ADDED" | "REMOVED" | "CHANGED";
export type ResourceType =
  | "Project"
  | "Bucket"
  | "Dataset"
  | "ServiceAccount"
  | "Topic"
  | "KMSKeyRing"
  | string;

export interface PolicySnapshot {
  id: string;
  name: string;
  scope: ScopeKind;
  resourceType: ResourceType;
  resourcePath: string;
  status: SnapshotStatus;
  bindingCount: number;
  collectedAt: string;
}

export interface BindingDiff {
  id: string;
  snapshotId: string;
  resourcePath: string;
  resourceType: ResourceType;
  scope: ScopeKind;
  status: DriftStatus;
  role: string;
  member: string;
  condition?: string;
  changeWindowHours: number;
  isPublic?: boolean;
  isPrivileged?: boolean;
  violatesOrgPolicy?: boolean;
  note?: string;
}

export interface PolicyDiffExport {
  snapshots?: PolicySnapshot[];
  diffs?: BindingDiff[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-current-snapshot"
  | "stale-snapshot"
  | "viewer-to-allusers"
  | "editor-basic-role-grant"
  | "service-account-token-creator"
  | "org-policy-guardrail-missing"
  | "folder-inheritance-drift"
  | "stale-diff-window";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  subject: string;
  subjectName?: string;
  scope?: ScopeKind;
  role?: string;
  member?: string;
}

export interface DiffReport {
  generatedAt: string;
  snapshots: number;
  currentSnapshots: number;
  diffs: number;
  publicBindings: number;
  privilegedBindings: number;
  orgPolicyDrifts: number;
  findingsList: Finding[];
  ok: boolean;
}

export interface DiffOptions {
  now?: string;
  staleDiffAfterHours?: number;
}
