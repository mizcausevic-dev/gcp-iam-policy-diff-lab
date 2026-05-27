# Changelog

## v0.1.0 — 2026-05-30

- Initial release: operator surface for GCP IAM policy snapshot drift and org-policy posture.
- Added a public dashboard surface with overview, policy-lane, binding-risks, drift-posture, verification, and docs routes.
- Added prerendered GitHub Pages packaging for `gcp.kineticgain.com` with `CNAME`, `robots.txt`, `sitemap.xml`, and OG/meta injection at deploy time.
- Added synthetic README proof screenshots and `docs/KINETIC_GAIN_EMBEDDED.md` tie-back packaging.
- Reads a combined JSON envelope `{ snapshots, diffs }` — each section is optional.
- 8 finding codes covering missing current snapshots, stale snapshots, public `allUsers` bindings, `roles/editor` drift, service-account token creator grants, org-policy guardrail mismatch, folder inheritance drift, and stale diff windows.
- Library API: `analyze(input, opts)` -> `DiffReport`; `toMarkdown(report)` + `toSummary(report)` formatters.
- CLI: `gcp-iam-policy-diff <export.json>` with `--format json|markdown|summary`, `--now <iso>`, `--stale-diff-after-hours N`, `--fail-on-high`, `--out FILE`.
- Multi-cloud security lane (Wave 12) — opens the GCP identity and guardrail track next to the Microsoft and AWS admin portfolio.
- Node 20/22 CI (lint, typecheck, coverage, build, demo, smoke, prerender, `npm audit`), AGPL-3.0-or-later, Dependabot.
