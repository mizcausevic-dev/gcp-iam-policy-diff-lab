import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "./app.js";

describe("app", () => {
  test("serves overview and docs", async () => {
    const overview = await request(app).get("/");
    expect(overview.status).toBe(200);
    expect(overview.text).toContain("GCP IAM bindings, org-policy drift");

    const docs = await request(app).get("/docs");
    expect(docs.status).toBe(200);
    expect(docs.text).toContain("Offline policy diff analysis");
  });

  test("serves summary and sample apis", async () => {
    const summary = await request(app).get("/api/dashboard/summary");
    expect(summary.status).toBe(200);
    expect(summary.body.snapshots).toBe(2);

    const sample = await request(app).get("/api/sample");
    expect(sample.status).toBe(200);
    expect(sample.body.sample.snapshots).toHaveLength(2);
  });
});
