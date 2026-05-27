#!/usr/bin/env node

import fs from "node:fs";

import { analyze } from "./analyze.js";
import { toMarkdown, toSummary } from "./format.js";
import type { PolicyDiffExport } from "./types.js";

type Format = "json" | "markdown" | "summary";

function usage(): string {
  return [
    "Usage: gcp-iam-policy-diff <export.json> [options]",
    "",
    "Options:",
    "  --format <json|markdown|summary>  Output format (default: summary)",
    "  --now <iso>                        Override analysis time",
    "  --stale-diff-after-hours <n>      Drift SLA before low-severity stale flag (default: 24)",
    "  --fail-on-high                    Exit 1 if any high findings remain",
    "  --out <file>                      Write output to file"
  ].join("\n");
}

function parseArgs(argv: string[]) {
  const args = [...argv];
  const file = args.shift();
  if (!file) {
    throw new Error(usage());
  }

  let format: Format = "summary";
  let now: string | undefined;
  let staleDiffAfterHours: number | undefined;
  let failOnHigh = false;
  let out: string | undefined;

  while (args.length > 0) {
    const flag = args.shift();
    switch (flag) {
      case "--format":
        format = (args.shift() as Format | undefined) ?? "summary";
        break;
      case "--now":
        now = args.shift();
        break;
      case "--stale-diff-after-hours":
        staleDiffAfterHours = Number(args.shift());
        break;
      case "--fail-on-high":
        failOnHigh = true;
        break;
      case "--out":
        out = args.shift();
        break;
      default:
        throw new Error(`Unknown flag: ${flag}\n\n${usage()}`);
    }
  }

  return { file, format, now, staleDiffAfterHours, failOnHigh, out };
}

function render(format: Format, payload: ReturnType<typeof analyze>): string {
  switch (format) {
    case "json":
      return JSON.stringify(payload, null, 2);
    case "markdown":
      return toMarkdown(payload);
    case "summary":
    default:
      return toSummary(payload);
  }
}

async function main() {
  const { file, format, now, staleDiffAfterHours, failOnHigh, out } = parseArgs(process.argv.slice(2));
  const input = JSON.parse(fs.readFileSync(file, "utf8")) as PolicyDiffExport;
  const report = analyze(input, { now, staleDiffAfterHours });
  const output = render(format, report);

  if (out) {
    fs.writeFileSync(out, output, "utf8");
  } else {
    process.stdout.write(`${output}\n`);
  }

  if (failOnHigh && report.findingsList.some((finding) => finding.severity === "high")) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
