import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { PolicyDiffExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): PolicyDiffExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as PolicyDiffExport;

const NOW = "2026-05-30T00:00:00Z";

describe("analyze", () => {
  it("counts snapshots and diffs", () => {
    const report = analyze(fixture("gcp-policy-diff.json"), { now: NOW });
    expect(report.snapshots).toBe(2);
    expect(report.currentSnapshots).toBe(1);
    expect(report.diffs).toBe(4);
  });

  it("flags missing current snapshot as high", () => {
    const report = analyze({ snapshots: [], diffs: [] }, { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "no-current-snapshot")?.severity).toBe("high");
  });

  it("flags stale snapshots", () => {
    const report = analyze(fixture("gcp-policy-diff.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "stale-snapshot")?.subjectName).toContain("folders/7091448821");
  });

  it("flags public viewer bindings", () => {
    const report = analyze(fixture("gcp-policy-diff.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "viewer-to-allusers")?.member).toBe("allUsers");
  });

  it("flags basic editor role drift", () => {
    const report = analyze(fixture("gcp-policy-diff.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "editor-basic-role-grant")?.role).toBe("roles/editor");
  });

  it("flags token creator drift", () => {
    const report = analyze(fixture("gcp-policy-diff.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "service-account-token-creator")?.member).toContain("legacy-sync");
  });

  it("flags folder inheritance drift and stale diff windows", () => {
    const report = analyze(fixture("gcp-policy-diff.json"), { now: NOW, staleDiffAfterHours: 24 });
    expect(report.findingsList.find((finding) => finding.code === "folder-inheritance-drift")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "stale-diff-window")).toBeDefined();
  });

  it("ok=true on a clean fixture", () => {
    const report = analyze(fixture("gcp-policy-diff-clean.json"), { now: NOW });
    expect(report.ok).toBe(true);
    expect(report.findingsList.filter((finding) => finding.severity === "high")).toEqual([]);
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first", () => {
    const markdown = toMarkdown(analyze(fixture("gcp-policy-diff.json"), { now: NOW }));
    expect(markdown).toContain("❌");
    expect(markdown.indexOf("🔴")).toBeLessThan(markdown.indexOf("🟠"));
  });

  it("toSummary emits a one-liner", () => {
    const summary = toSummary(analyze(fixture("gcp-policy-diff.json"), { now: NOW }));
    expect(summary).toMatch(/snapshots/);
    expect(summary).toMatch(/diffs/);
  });
});
