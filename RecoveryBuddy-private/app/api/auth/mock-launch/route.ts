import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, sessionCookieOptions } from "@/app/_server/auth/session";
import { findSyntheticPatient } from "@/app/_server/db/mock-store";
import { recordAudit } from "@/app/_server/audit/audit";
import { randomUUID } from "node:crypto";

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get("patient") ?? "";
  const patient = await findSyntheticPatient(patientId);
  if (!patient) return NextResponse.json({ error: "UNKNOWN_SYNTHETIC_PATIENT" }, { status: 404 });

  const session = createSessionValue({
    ...patient,
    issuer: "mock-minddistrict",
    role: "patient",
  });
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(SESSION_COOKIE, session, sessionCookieOptions);
  await recordAudit({
    actorId: patient.userId,
    action: "auth.mock_minddistrict_launch",
    outcome: "success",
    correlationId: randomUUID(),
    resourceType: "Patient",
    resourceId: patient.minddistrictPatientId,
  });
  return response;
}
