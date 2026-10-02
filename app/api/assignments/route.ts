import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { MinddistrictCapability } from "@/app/_domain/minddistrict/types";
import { getSession } from "@/app/_server/auth/session";
import { recordAudit } from "@/app/_server/audit/audit";
import { minddistrictGateway, patientContext } from "@/app/_server/minddistrict";

const capabilities: MinddistrictCapability[] = ["relapse_prevention", "act", "mindfulness", "sleep"];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const assignments = await minddistrictGateway().getAssignments(patientContext(session));
  return NextResponse.json({ assignments });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = await request.json().catch(() => null) as { capability?: unknown } | null;
  if (!body || !capabilities.includes(body.capability as MinddistrictCapability)) {
    return NextResponse.json({ error: "INVALID_CAPABILITY" }, { status: 400 });
  }
  const correlationId = request.headers.get("x-correlation-id") ?? randomUUID();
  const assignment = await minddistrictGateway().assignActivity(
    patientContext(session),
    body.capability as MinddistrictCapability,
  );
  await recordAudit({
    actorId: session.userId,
    action: "minddistrict.activity.assign",
    outcome: "success",
    correlationId,
    resourceType: "Task",
    resourceId: assignment.taskId,
  });
  return NextResponse.json({ assignment }, { status: 201 });
}
