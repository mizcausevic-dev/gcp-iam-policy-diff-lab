import {
  type DiffOptions,
  type DiffReport,
  type Finding,
  type PolicyDiffExport
} from "./types.js";

export function analyze(input: PolicyDiffExport, opts: DiffOptions = {}): DiffReport {
  const now = opts.now ? new Date(opts.now) : new Date();
  const staleDiffAfterHours = opts.staleDiffAfterHours ?? 24;

  const snapshots = input.snapshots ?? [];
  const diffs = input.diffs ?? [];
  const findingsList: Finding[] = [];

  const currentSnapshots = snapshots.filter((snapshot) => snapshot.status === "CURRENT");
  const publicBindings = diffs.filter((diff) => diff.isPublic === true);
  const privilegedBindings = diffs.filter((diff) => diff.isPrivileged === true);
  const orgPolicyDrifts = diffs.filter((diff) => diff.violatesOrgPolicy === true);

  if (currentSnapshots.length === 0) {
    findingsList.push({
      code: "no-current-snapshot",
      severity: "high",
      message: "No current GCP IAM policy snapshot is available for the captured estate.",
      subject: "snapshots"
    });
  }

  for (const snapshot of snapshots) {
    if (snapshot.status === "STALE") {
      findingsList.push({
        code: "stale-snapshot",
        severity: "medium",
        message: `Snapshot "${snapshot.name}" is stale and can no longer be trusted as the live IAM baseline.`,
        subject: snapshot.id,
        subjectName: snapshot.resourcePath,
        scope: snapshot.scope
      });
    }
  }

  for (const diff of diffs) {
    if (diff.isPublic && diff.role.toLowerCase().includes("viewer")) {
      findingsList.push({
        code: "viewer-to-allusers",
        severity: "high",
        message: `Public viewer access is active on "${diff.resourcePath}" via ${diff.member}.`,
        subject: diff.id,
        subjectName: diff.resourcePath,
        scope: diff.scope,
        role: diff.role,
        member: diff.member
      });
    }

    if (diff.isPrivileged && diff.role === "roles/editor") {
      findingsList.push({
        code: "editor-basic-role-grant",
        severity: "high",
        message: `Basic role "${diff.role}" is still granted on "${diff.resourcePath}".`,
        subject: diff.id,
        subjectName: diff.resourcePath,
        scope: diff.scope,
        role: diff.role,
        member: diff.member
      });
    }

    if (diff.isPrivileged && diff.role === "roles/iam.serviceAccountTokenCreator") {
      findingsList.push({
        code: "service-account-token-creator",
        severity: "high",
        message: `Token creator access on "${diff.resourcePath}" should be validated before production federation expands.`,
        subject: diff.id,
        subjectName: diff.resourcePath,
        scope: diff.scope,
        role: diff.role,
        member: diff.member
      });
    }

    if (diff.violatesOrgPolicy) {
      findingsList.push({
        code: "org-policy-guardrail-missing",
        severity: "medium",
        message: `Binding drift on "${diff.resourcePath}" no longer matches the intended org-policy guardrail.`,
        subject: diff.id,
        subjectName: diff.resourcePath,
        scope: diff.scope,
        role: diff.role,
        member: diff.member
      });
    }

    if (diff.scope === "FOLDER" && diff.status === "CHANGED") {
      findingsList.push({
        code: "folder-inheritance-drift",
        severity: "medium",
        message: `Folder-level inheritance drift is changing effective access on "${diff.resourcePath}".`,
        subject: diff.id,
        subjectName: diff.resourcePath,
        scope: diff.scope,
        role: diff.role,
        member: diff.member
      });
    }

    if (diff.changeWindowHours > staleDiffAfterHours) {
      findingsList.push({
        code: "stale-diff-window",
        severity: "low",
        message: `Binding drift on "${diff.resourcePath}" has remained unresolved for ${diff.changeWindowHours} hours.`,
        subject: diff.id,
        subjectName: diff.resourcePath,
        scope: diff.scope,
        role: diff.role,
        member: diff.member
      });
    }
  }

  return {
    generatedAt: now.toISOString(),
    snapshots: snapshots.length,
    currentSnapshots: currentSnapshots.length,
    diffs: diffs.length,
    publicBindings: publicBindings.length,
    privilegedBindings: privilegedBindings.length,
    orgPolicyDrifts: orgPolicyDrifts.length,
    findingsList,
    ok: !findingsList.some((finding) => finding.severity === "high")
  };
}
