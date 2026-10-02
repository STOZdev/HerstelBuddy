import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createSessionValue, verifySessionValue } from "../app/_server/auth/session";

describe("mock Minddistrict session", () => {
  beforeEach(() => {
    process.env.MOCK_SESSION_SECRET = "test-secret-with-more-than-thirty-two-characters";
  });

  it("accepts a signed, unexpired synthetic patient session", () => {
    const now = Date.parse("2026-09-23T08:00:00.000Z");
    const value = createSessionValue({
      userId: "user-1",
      issuer: "mock-minddistrict",
      subject: "subject-1",
      minddistrictTenant: "umcu-demo",
      minddistrictPatientId: "md-patient-1",
      displayName: "Synthetic Patient",
      role: "patient",
    }, now);

    expect(verifySessionValue(value, now + 1000)?.minddistrictPatientId).toBe("md-patient-1");
  });

  it("rejects tampering and expired sessions", () => {
    const now = Date.parse("2026-09-23T08:00:00.000Z");
    const value = createSessionValue({
      userId: "user-1",
      issuer: "mock-minddistrict",
      subject: "subject-1",
      minddistrictTenant: "umcu-demo",
      minddistrictPatientId: "md-patient-1",
      displayName: "Synthetic Patient",
      role: "patient",
    }, now);

    expect(verifySessionValue(`${value}changed`, now + 1000)).toBeNull();
    expect(verifySessionValue(value, now + 61 * 60 * 1000)).toBeNull();
  });
});
